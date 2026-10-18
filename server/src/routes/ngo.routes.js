import { Router } from 'express'
import { query } from 'express-validator'
import User from '../models/User.js'
import { rankNgos } from '../services/matchingEngine.js'
import { protect, authorise } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// GET /api/ngos/nearby?lat=&lng=&deadline=&category=
router.get(
  '/nearby',
  protect,
  authorise('DONOR'),
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid lat required'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid lng required'),
    query('deadline').isISO8601().withMessage('Valid ISO8601 deadline required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { lat, lng, deadline } = req.query
      const ngos = await User.find({ role: 'NGO', isActive: true })
      const ranked = rankNgos(
        { lat: parseFloat(lat), lng: parseFloat(lng) },
        new Date(deadline),
        ngos
      )
      res.json({ success: true, count: ranked.length, data: ranked })
    } catch (err) { next(err) }
  }
)

export default router
