import { Router } from 'express'

import authRouter from './auth/auth.router'
import peopleRouter from './people/people.router'
import permissionGroupsRouter from './permission-groups/permission-groups.router'

const router = Router()

router.use('/auth', authRouter)
router.use('/people', peopleRouter)
router.use('/permission-groups', permissionGroupsRouter)

export default router
