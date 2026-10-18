import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
})

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'lbs', 'servings', 'items', 'boxes', 'trays'],
      default: 'kg',
    },
    categories: [{ type: String }],     // AI-populated
    allergens:  [{ type: String }],     // AI-populated
    status: {
      type: String,
      enum: ['available', 'claimed', 'completed', 'expired'],
      default: 'available',
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    aiClassified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Geo index for location-based queries
listingSchema.index({ 'location.coordinates': '2dsphere' })
listingSchema.index({ status: 1, expiresAt: 1 })
listingSchema.index({ donor: 1 })

const Listing = mongoose.model('Listing', listingSchema)
export default Listing
