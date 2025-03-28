import { Router } from 'express'

import peopleRouter from './people/people.router'

const router = Router()

router.use('/people', peopleRouter)

export default router
