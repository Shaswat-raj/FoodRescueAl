import bcrypt from 'bcryptjs'
import crypto from 'crypto'

/** Generate a 6-digit OTP string */
export const generateOTP = () => {
  return String(crypto.randomInt(100000, 999999))
}

/** Hash the raw OTP for storage (10 rounds - balance of speed vs security) */
export const hashOTP = (otp) => bcrypt.hash(otp, 10)

/** Verify raw OTP against stored hash */
export const verifyOTP = (otp, hash) => bcrypt.compare(otp, hash)

/** OTP validity window: 4 hours */
export const OTP_TTL_MS = 4 * 60 * 60 * 1000

export const OTP_MAX_ATTEMPTS = 5
