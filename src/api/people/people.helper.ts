import { Db, ObjectId } from 'mongodb'

import { Languages, Permissions } from '../../types/global.enums'
import { findByPermissionGroupIDs } from '../permission-groups/permission-groups.dao'
import { mapPermissionGroupRef } from '../permission-groups/permission-groups.helper'
import { TypePerson, TypePersonRef } from './people.types'

const mapPerson = (body: TypePerson, { permissionGroups = [] }) => {
  return {
    language: Languages.Brazilian,
    deleted: false,
    permissionGroups: [],
    ...body,
    ...(permissionGroups.length && {
      permissionGroups: permissionGroups.map(mapPermissionGroupRef),
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

const mapPersonRef = (person: TypePerson): TypePersonRef => {
  return {
    _id: new ObjectId(person._id.toString()),
    name: person.name,
    email: person.email,
    photo: person.photo,
  }
}

const mapPersonPermissions = async (
  db: Db,
  person: TypePerson,
): Promise<Permissions[]> => {
  const permissionGroupIDs = person.permissionGroups.map(({ _id }) =>
    _id.toString(),
  )
  const permissionGroups = await findByPermissionGroupIDs(
    db,
    permissionGroupIDs,
  )

  if (!permissionGroups) {
    return []
  }

  const allPermissions: Permissions[] = []

  permissionGroups.forEach(permissionGroup => {
    permissionGroup.permissions.forEach(permission => {
      if (permission.active === false) {
        return
      }

      allPermissions.push(permission.module)

      if (permission.permissions?.length) {
        allPermissions.push(...permission.permissions)
      }
    })
  })

  return [...new Set(allPermissions)]
}

const checkIfAdmin = async (db: Db, person: TypePerson) => {
  const permissionGroupsIDs = (person?.permissionGroups || []).map(
    permissionGroup => permissionGroup._id.toString(),
  )

  const permissionGroups = await findByPermissionGroupIDs(
    db,
    permissionGroupsIDs,
  )

  const isAdmin = permissionGroups.some(
    permissionGroup => permissionGroup.admin,
  )

  return isAdmin
}

export { mapPerson, mapPersonRef, mapPersonPermissions, checkIfAdmin }
