import mongoose from 'mongoose'

const pickupAssignmentSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      unique: true,
    },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    volunteer: {
      name:  { type: String, required: true, trim: true },
      idRef: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },

    otpHash:     { type: String, required: true, select: false },
    otpExpiry:   { type: Date,   required: true },
    otpAttempts: { type: Number, default: 0 },
    otpUsed:     { type: Boolean, default: false },

    assignedAt:  { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('PickupAssignment', pickupAssignmentSchema)
