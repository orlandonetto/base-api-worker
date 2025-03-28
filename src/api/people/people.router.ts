import { Router } from 'express'

import { validatePermissions } from '../../middlewares/permission-middleware'
import { Permissions } from '../../types/global.enums'
import { validatePermissionGroupsExistence } from '../permission-groups/permission-groups.middleware'
import {
  createPerson,
  fetchPerson,
  fetchPeople,
  editPerson,
  removePerson,
} from './people.controller'
import {
  validateCreatePersonSchema,
  validateFetchPeopleSchema,
  validateFetchPersonSchema,
  validateEditPersonSchema,
  validateRemovePersonSchema,
  validateUniquePerson,
  validatePersonExistence,
} from './people.middleware'

const router = Router()

router.post('/', [
  validatePermissions([Permissions.PeopleCreate]),
  validateCreatePersonSchema,
  validateUniquePerson,
  validatePermissionGroupsExistence,
  createPerson,
])

router.get('/', [
  validatePermissions([Permissions.People]),
  validateFetchPeopleSchema,
  fetchPeople,
])

router.get('/:personID', [
  validateFetchPersonSchema,
  validatePersonExistence,
  fetchPerson,
])

router.put('/:personID', [
  validatePermissions([Permissions.PeopleEdit]),
  validateEditPersonSchema,
  validatePersonExistence,
  validatePermissionGroupsExistence,
  editPerson,
])

router.delete('/:personID', [
  validatePermissions([Permissions.PeopleDelete]),
  validateRemovePersonSchema,
  validatePersonExistence,
  removePerson,
])

export default router
