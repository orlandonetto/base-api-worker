import { ObjectId } from 'mongodb'

import {
  TypePermissionGroup,
  TypePermissionRef,
} from './permission-groups.types'

const mapPermissionGroup = (body): TypePermissionGroup => {
  return {
    ...body,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

const mapPermissionGroupRef = (
  permissionGroup: TypePermissionGroup,
): TypePermissionRef => {
  return {
    _id: new ObjectId(permissionGroup._id.toString()),
    name: permissionGroup.name,
  }
}

export { mapPermissionGroup, mapPermissionGroupRef }
