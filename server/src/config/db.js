import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in environment')
  const conn = await mongoose.connect(uri)
  console.log(`✅ MongoDB connected: ${conn.connection.host}`)
}

export default connectDB
