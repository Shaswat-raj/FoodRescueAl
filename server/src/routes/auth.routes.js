import { Router } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
    body('role').isIn(['DONOR', 'NGO']).withMessage('Role must be DONOR or NGO'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('organization').if(body('role').equals('NGO')).notEmpty().withMessage('Organization required for NGO'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role, phone, address, coordinates, organization, pickupCapacity } = req.body
      const user = await User.create({
        name, email, passwordHash: password, role,
        phone, address, coordinates, organization,
        pickupCapacity: pickupCapacity || 0,
      })
      const token = signToken(user._id)
      res.status(201).json({ success: true, token, user })
    } catch (err) { next(err) }
  }
)

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email }).select('+passwordHash')
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' })
      }
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' })
      }
      const token = signToken(user._id)
      user.passwordHash = undefined
      res.json({ success: true, token, user })
    } catch (err) { next(err) }
  }
)

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user })
})

export default router
