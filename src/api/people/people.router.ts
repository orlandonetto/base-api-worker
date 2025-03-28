import { Router } from 'express'

import { processSendSuccess } from '../../middlewares/auth-middleware'
import { processPeoplePost } from './people.controller'

const router = Router()

router.post('/post', [processPeoplePost, processSendSuccess])

export default router
