import mongoose from 'mongoose'

export const NOTIFICATION_TYPES = [
  'REQUEST_RECEIVED',
  'ACCEPTED',
  'REJECTED',
  'ASSIGNED',
  'PICKUP_STARTED',
  'COMPLETED',
  'CANCELLED',
]

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donation:  { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null },
    type:      { type: String, enum: NOTIFICATION_TYPES, required: true },
    message:   { type: String, required: true },
    read:      { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, read: 1 })

export default mongoose.model('Notification', notificationSchema)
