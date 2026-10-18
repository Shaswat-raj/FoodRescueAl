import mongoose from 'mongoose'

export const DONATION_STATUS = {
  REQUESTED:          'REQUESTED',
  ACCEPTED:           'ACCEPTED',
  ASSIGNED:           'ASSIGNED',
  PICKUP_IN_PROGRESS: 'PICKUP_IN_PROGRESS',
  COMPLETED:          'COMPLETED',
  REJECTED:           'REJECTED',
  CANCELLED:          'CANCELLED',
}

export const FOOD_CATEGORIES = [
  'cooked_meal', 'raw_produce', 'bakery', 'dairy',
  'packaged', 'beverages', 'other',
]

const coordinatesSchema = new mongoose.Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  { _id: false }
)

const donationSchema = new mongoose.Schema(
  {
    donor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    foodName:         { type: String, required: true, trim: true },
    category:         { type: String, enum: FOOD_CATEGORIES, required: true },
    quantity:         { type: Number, required: true, min: 1 },
    unit:             { type: String, required: true, enum: ['kg', 'litres', 'servings', 'items', 'boxes'] },
    preparedAt:       { type: Date, required: true },
    safeUseBy:        { type: Date, required: true },
    storageConditions:{ type: String, trim: true },
    pickupAddress:    { type: String, required: true, trim: true },
    pickupCoordinates:{ type: coordinatesSchema, required: true },
    notes:            { type: String, trim: true },

    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.REQUESTED,
    },
  },
  { timestamps: true }
)

donationSchema.index({ donor: 1 })
donationSchema.index({ assignedNgo: 1 })
donationSchema.index({ status: 1 })

export default mongoose.model('Donation', donationSchema)
