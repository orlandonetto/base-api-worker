import { Router } from 'express'

import { uploadSingle } from '../../middlewares/upload-middleware'
import { editPerson, removePerson } from '../people/people.controller'
import { validateUniquePerson } from '../people/people.middleware'
import { validateTokenExistence } from '../tokens/tokens.middleware'
import {
  fetchAuthData,
  localAdminAuth,
  localAuth,
  localSignUp,
  refreshTokens,
  signOut,
} from './auth.controller'
import {
  validateDeleteProfile,
  validateEditProfileSchema,
  validateLocalAuthSchema,
  validateLocalSignUpSchema,
  validatePersonPhoto,
  validateRefreshTokenSchema,
} from './auth.middleware'

const router = Router()

router.post('/local/sign-up', [
  uploadSingle('file'),
  validateLocalSignUpSchema,
  validateUniquePerson,
  validatePersonPhoto,
  localSignUp,
])

router.post('/local', [validateLocalAuthSchema, localAuth])

router.post('/local/admin', [validateLocalAuthSchema, localAdminAuth])

router.put('/refresh', [
  validateRefreshTokenSchema,
  validateTokenExistence,
  refreshTokens,
])

router.delete('/sign-out', [signOut])

router.put('/', [validateEditProfileSchema, editPerson])

router.get('/', [fetchAuthData])

router.delete('/', [validateDeleteProfile, removePerson])

export default router
