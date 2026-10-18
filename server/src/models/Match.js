import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
    },
    aiReason: {
      type: String, // AI-generated explanation for the match
    },
    acceptedAt:  { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

const Match = mongoose.model('Match', matchSchema)
export default Match
