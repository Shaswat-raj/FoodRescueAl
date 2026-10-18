import { Router } from 'express'
import { body } from 'express-validator'
import Donation, { DONATION_STATUS, FOOD_CATEGORIES } from '../models/Donation.js'
import PickupAssignment from '../models/PickupAssignment.js'
import { protect, authorise } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { generateOTP, hashOTP, verifyOTP, OTP_TTL_MS, OTP_MAX_ATTEMPTS } from '../utils/otp.js'
import { createNotification } from '../utils/notify.js'

const router = Router()
router.use(protect)

// ── POST /api/donations ──────────────────────────────────────────────────────
router.post(
  '/',
  authorise('DONOR'),
  [
    body('foodName').trim().notEmpty().withMessage('Food name required'),
    body('category').isIn(FOOD_CATEGORIES).withMessage('Invalid category'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be ≥ 1'),
    body('unit').isIn(['kg', 'litres', 'servings', 'items', 'boxes']).withMessage('Invalid unit'),
    body('preparedAt').isISO8601().withMessage('Valid preparedAt date required'),
    body('safeUseBy').isISO8601().withMessage('Valid safeUseBy date required'),
    body('pickupAddress').trim().notEmpty().withMessage('Pickup address required'),
    body('pickupCoordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid lat required'),
    body('pickupCoordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid lng required'),
    body('assignedNgoId').notEmpty().withMessage('NGO selection required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        foodName, category, quantity, unit,
        preparedAt, safeUseBy, storageConditions,
        pickupAddress, pickupCoordinates, notes, assignedNgoId,
      } = req.body

      const donation = await Donation.create({
        donor: req.user._id,
        assignedNgo: assignedNgoId,
        foodName, category, quantity, unit,
        preparedAt, safeUseBy, storageConditions,
        pickupAddress, pickupCoordinates, notes,
      })

      // Notify NGO
      await createNotification(
        assignedNgoId,
        donation._id,
        'REQUEST_RECEIVED',
        `New donation request: "${foodName}" from ${req.user.name}`
      )

      const populated = await donation.populate([
        { path: 'donor', select: 'name email phone address' },
        { path: 'assignedNgo', select: 'name organization phone' },
      ])

      res.status(201).json({ success: true, data: populated })
    } catch (err) { next(err) }
  }
)

// ── GET /api/donations/my ────────────────────────────────────────────────────
router.get('/my', async (req, res, next) => {
  try {
    const filter = req.user.role === 'DONOR'
      ? { donor: req.user._id }
      : { assignedNgo: req.user._id }

    const donations = await Donation.find(filter)
      .populate('donor', 'name email phone address')
      .populate('assignedNgo', 'name organization phone')
      .sort({ createdAt: -1 })

    res.json({ success: true, count: donations.length, data: donations })
  } catch (err) { next(err) }
})

// ── GET /api/donations/available (NGO only) ──────────────────────────────────
router.get('/available', authorise('NGO'), async (req, res, next) => {
  try {
    const donations = await Donation.find({
      assignedNgo: req.user._id,
      status: DONATION_STATUS.REQUESTED,
    })
      .populate('donor', 'name email phone address coordinates')
      .sort({ createdAt: -1 })

    res.json({ success: true, count: donations.length, data: donations })
  } catch (err) { next(err) }
})

// ── GET /api/donations/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone address coordinates')
      .populate('assignedNgo', 'name organization phone address coordinates')

    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' })

    // Only donor or assigned NGO may view
    const isDonor = donation.donor._id.toString() === req.user._id.toString()
    const isNgo   = donation.assignedNgo?._id.toString() === req.user._id.toString()
    if (!isDonor && !isNgo) {
      return res.status(403).json({ success: false, message: 'Not authorised to view this donation' })
    }

    // Include assignment details (without otpHash)
    const assignment = await PickupAssignment.findOne({ donation: donation._id })
      .select('-otpHash')

    res.json({ success: true, data: donation, assignment: assignment || null })
  } catch (err) { next(err) }
})

// ── PATCH /api/donations/:id/accept ─────────────────────────────────────────
router.patch('/:id/accept', authorise('NGO'), async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' })
    if (donation.assignedNgo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This request is not assigned to your NGO' })
    }
    if (donation.status !== DONATION_STATUS.REQUESTED) {
      return res.status(400).json({ success: false, message: `Cannot accept a donation with status: ${donation.status}` })
    }

    donation.status = DONATION_STATUS.ACCEPTED
    await donation.save()

    await createNotification(
      donation.donor, donation._id, 'ACCEPTED',
      `Your donation "${donation.foodName}" has been accepted by ${req.user.organization || req.user.name}`
    )

    res.json({ success: true, data: donation })
  } catch (err) { next(err) }
})

// ── PATCH /api/donations/:id/reject ─────────────────────────────────────────
router.patch('/:id/reject', authorise('NGO'), async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' })
    if (donation.assignedNgo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This request is not assigned to your NGO' })
    }
    if (donation.status !== DONATION_STATUS.REQUESTED) {
      return res.status(400).json({ success: false, message: `Cannot reject a donation with status: ${donation.status}` })
    }

    donation.status = DONATION_STATUS.REJECTED
    await donation.save()

    await createNotification(
      donation.donor, donation._id, 'REJECTED',
      `Your donation "${donation.foodName}" was declined by ${req.user.organization || req.user.name}`
    )

    res.json({ success: true, data: donation })
  } catch (err) { next(err) }
})

// ── PATCH /api/donations/:id/cancel (DONOR only) ────────────────────────────
router.patch('/:id/cancel', authorise('DONOR'), async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' })
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your donation' })
    }
    if (donation.status !== DONATION_STATUS.REQUESTED) {
      return res.status(400).json({ success: false, message: 'Can only cancel a REQUESTED donation' })
    }

    donation.status = DONATION_STATUS.CANCELLED
    await donation.save()

    if (donation.assignedNgo) {
      await createNotification(
        donation.assignedNgo, donation._id, 'CANCELLED',
        `Donation "${donation.foodName}" has been cancelled by the donor`
      )
    }

    res.json({ success: true, data: donation })
  } catch (err) { next(err) }
})

// ── POST /api/donations/:id/assign ──────────────────────────────────────────
router.post(
  '/:id/assign',
  authorise('NGO'),
  [
    body('volunteer.name').trim().notEmpty().withMessage('Volunteer name required'),
    body('volunteer.idRef').trim().notEmpty().withMessage('Volunteer ID reference required'),
    body('volunteer.phone').trim().notEmpty().withMessage('Volunteer phone required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const donation = await Donation.findById(req.params.id)
      if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' })
      if (donation.assignedNgo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'This request is not assigned to your NGO' })
      }
      if (donation.status !== DONATION_STATUS.ACCEPTED) {
        return res.status(400).json({ success: false, message: `Cannot assign volunteer on a donation with status: ${donation.status}` })
      }

      const rawOtp = generateOTP()
      const otpHash = await hashOTP(rawOtp)
      const otpExpiry = new Date(Date.now() + OTP_TTL_MS)

      // Remove any previous assignment (e.g. re-assign)
      await PickupAssignment.deleteOne({ donation: donation._id })

      const assignment = await PickupAssignment.create({
        donation: donation._id,
        ngo: req.user._id,
        volunteer: req.body.volunteer,
        otpHash,
        otpExpiry,
      })

      donation.status = DONATION_STATUS.ASSIGNED
      await donation.save()

      await createNotification(
        donation.donor, donation._id, 'ASSIGNED',
        `A volunteer (${req.body.volunteer.name}) has been assigned to collect your donation "${donation.foodName}". Share OTP: ${rawOtp}`
      )

      // Return raw OTP once — for demo. In production, send via SMS/email.
      res.json({
        success: true,
        data: donation,
        assignment: {
          _id: assignment._id,
          volunteer: assignment.volunteer,
          otpExpiry: assignment.otpExpiry,
        },
        otp: rawOtp, // DEMO ONLY
      })
    } catch (err) { next(err) }
  }
)

// ── POST /api/donations/:id/verify-pickup ────────────────────────────────────
router.post(
  '/:id/verify-pickup',
  authorise('NGO'),
  [body('otp').trim().notEmpty().withMessage('OTP required')],
  validate,
  async (req, res, next) => {
    try {
      const donation = await Donation.findById(req.params.id)
      if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' })
      if (donation.assignedNgo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorised for this donation' })
      }
      if (donation.status !== DONATION_STATUS.ASSIGNED) {
        return res.status(400).json({ success: false, message: `Invalid status for pickup verification: ${donation.status}` })
      }

      const assignment = await PickupAssignment.findOne({ donation: donation._id }).select('+otpHash')
      if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' })

      if (assignment.otpUsed) {
        return res.status(400).json({ success: false, message: 'OTP has already been used' })
      }
      if (new Date() > assignment.otpExpiry) {
        return res.status(400).json({ success: false, message: 'OTP has expired' })
      }
      if (assignment.otpAttempts >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({ success: false, message: 'Maximum OTP attempts exceeded' })
      }

      const valid = await verifyOTP(req.body.otp, assignment.otpHash)
      if (!valid) {
        assignment.otpAttempts += 1
        await assignment.save()
        const remaining = OTP_MAX_ATTEMPTS - assignment.otpAttempts
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${remaining} attempt(s) remaining`,
        })
      }

      // OTP correct — complete pickup
      assignment.otpUsed = true
      assignment.otpAttempts += 1
      assignment.completedAt = new Date()
      await assignment.save()

      donation.status = DONATION_STATUS.COMPLETED
      await donation.save()

      // Notify both parties
      await createNotification(
        donation.donor, donation._id, 'COMPLETED',
        `Your donation "${donation.foodName}" has been successfully picked up. Thank you!`
      )
      await createNotification(
        req.user._id, donation._id, 'COMPLETED',
        `Pickup of "${donation.foodName}" completed successfully`
      )

      res.json({ success: true, message: 'Pickup verified and donation completed', data: donation })
    } catch (err) { next(err) }
  }
)

export default router
