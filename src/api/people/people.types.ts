import { ObjectId } from 'mongodb'

import { Languages, Permissions } from '../../types/global.enums'
import { TypeAddress } from '../../types/global.types'
import { TypePermissionGroup } from '../permission-groups/permission-groups.types'

type TypePerson = {
  _id: ObjectId | string
  deleted: boolean
  name: string
  email: string
  password: string
  cpf: string
  phone: string
  photo?: string
  gender?: string
  language: Languages
  permissions?: Permissions[]
  permissionGroups: TypePermissionGroup[]
  birthDate: Date
  address?: TypeAddress
  createdAt: Date
  updatedAt?: Date
}

type TypePersonRef = {
  _id: ObjectId | string
  name: string
  email: string
  photo?: string
  cpf?: string
  phone?: string
}

export { TypePerson, TypePersonRef }
