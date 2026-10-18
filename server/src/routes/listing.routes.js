import { Router } from 'express'
import { body } from 'express-validator'
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  claimListing,
} from '../controllers/listing.controller.js'
import { protect, authorise } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

router.use(protect)

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('unit').isIn(['kg', 'lbs', 'servings', 'items', 'boxes', 'trays']).withMessage('Invalid unit'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('expiresAt').isISO8601().withMessage('Valid expiry date required'),
]

router.get('/',    getListings)
router.get('/:id', getListing)
router.post('/',   authorise('donor', 'admin'), createValidation, validate, createListing)
router.put('/:id', updateListing)
router.delete('/:id', deleteListing)
router.post('/:id/claim', authorise('recipient'), claimListing)

export default router
