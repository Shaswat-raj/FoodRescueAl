import { Router } from 'express'
import { getUser, updateUser, getAllUsers } from '../controllers/user.controller.js'
import { protect, authorise } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/',    authorise('admin'), getAllUsers)
router.get('/:id', getUser)
router.put('/:id', updateUser)

export default router
