import { Router } from 'express'
import { getMatches, acceptMatch, declineMatch } from '../controllers/match.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/',              getMatches)
router.post('/:id/accept',  acceptMatch)
router.post('/:id/decline', declineMatch)

export default router
