import { Router } from 'express'

import { validatePermissions } from '../../middlewares/permission-middleware'
import { Permissions } from '../../types/global.enums'
import {
  createPermissionGroup,
  deletePermissionGroup,
  editPermissionGroup,
  fetchPermissionGroup,
  fetchPermissionGroups,
} from './permission-groups.controller'
import {
  validateCreatePermissionGroupSchema,
  validateDeletePermissionGroupSchema,
  validateEditPermissionGroupSchema,
  validateFetchPermissionGroupSchema,
  validateFetchPermissionGroupsSchema,
  validatePermissionGroupExistence,
} from './permission-groups.middleware'

const router = Router()

router.post('/', [
  validatePermissions([Permissions.PermissionGroupsCreate]),
  validateCreatePermissionGroupSchema,
  createPermissionGroup,
])

router.get('/', [
  validatePermissions([Permissions.PermissionGroups]),
  validateFetchPermissionGroupsSchema,
  fetchPermissionGroups,
])

router.get('/:permissionGroupID', [
  validatePermissions([Permissions.PermissionGroups]),
  validateFetchPermissionGroupSchema,
  validatePermissionGroupExistence,
  fetchPermissionGroup,
])

router.put('/:permissionGroupID', [
  validatePermissions([Permissions.PermissionGroupsEdit]),
  validateEditPermissionGroupSchema,
  validatePermissionGroupExistence,
  editPermissionGroup,
])

router.delete('/:permissionGroupID', [
  validatePermissions([Permissions.PermissionGroupsDelete]),
  validateDeletePermissionGroupSchema,
  validatePermissionGroupExistence,
  deletePermissionGroup,
])

export default router
