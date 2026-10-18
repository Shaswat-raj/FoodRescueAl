import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes         from './routes/auth.routes.js'
import ngoRoutes          from './routes/ngo.routes.js'
import donationRoutes     from './routes/donation.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(morgan('dev'))

// Rate-limit auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 })

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.use('/api/auth',          authLimiter, authRoutes)
app.use('/api/ngos',          ngoRoutes)
app.use('/api/donations',     donationRoutes)
app.use('/api/notifications', notificationRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
