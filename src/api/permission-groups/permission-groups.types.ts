import { ObjectId } from 'mongodb'

import { Permissions } from '../../types/global.enums'

type TypePermissionsModule = {
  module: Permissions
  active: boolean
  permissions: Permissions[]
}

type TypePermissionGroup = {
  _id?: ObjectId | string
  name?: string
  permissions?: TypePermissionsModule[]
  admin?: boolean
  deleted?: boolean
  default?: boolean
  createdAt?: Date
  updatedAt?: Date
}

type TypePermissionRef = {
  _id: ObjectId | string
  name: string
}

export { TypePermissionGroup, TypePermissionsModule, TypePermissionRef }
