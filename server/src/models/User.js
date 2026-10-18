import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const coordinatesSchema = new mongoose.Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role:         { type: String, enum: ['DONOR', 'NGO'], required: true },
    phone:        { type: String, required: true, trim: true },
    address:      { type: String, required: true, trim: true },
    coordinates:  { type: coordinatesSchema, required: true },
    // NGO-only
    organization:    { type: String, trim: true },
    pickupCapacity:  { type: Number, default: 0 }, // 0 = unlimited
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
)

userSchema.index({ role: 1 })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

// Never expose passwordHash
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  return obj
}

export default mongoose.model('User', userSchema)
