import { Db, ObjectId } from 'mongodb'

import { isDefined } from '../../helpers/object-helper'
import {
  buildPaginationPipeline,
  getQueryExactlyAttributeString,
  searchAttributeString,
} from '../../helpers/query-helper'
import { CollectionNames } from '../../types/global.enums'
import { TypePermissionGroup } from './permission-groups.types'

const findByPermissionGroupID = async (
  db: Db,
  permissionGroupID: string | ObjectId,
): Promise<TypePermissionGroup> => {
  const collection = db.collection<TypePermissionGroup>(
    CollectionNames.PermissionGroups,
  )

  return collection.findOne({
    _id: new ObjectId(permissionGroupID.toString()),
    deleted: false,
  })
}

const findByPermissionGroupIDs = async (
  db: Db,
  permissionGroupIDs: string[] | ObjectId[],
): Promise<TypePermissionGroup[]> => {
  const collection = db.collection<TypePermissionGroup>(
    CollectionNames.PermissionGroups,
  )

  return collection
    .find({
      _id: {
        $in: permissionGroupIDs.map(e => new ObjectId(e.toString())),
      },
      deleted: false,
    })
    .toArray()
}

const findDefaultPermissionGroups = async (
  db: Db,
): Promise<TypePermissionGroup[]> => {
  const collection = db.collection<TypePermissionGroup>(
    CollectionNames.PermissionGroups,
  )

  return collection
    .find({
      default: true,
      deleted: false,
    })
    .toArray()
}

const insertPermissionGroup = async (
  db: Db,
  permissionGroup: TypePermissionGroup,
) => {
  const collection = db.collection<TypePermissionGroup>(
    CollectionNames.PermissionGroups,
  )

  await collection.insertOne(permissionGroup)

  return findByPermissionGroupID(db, permissionGroup._id)
}

const updatePermissionGroup = async (
  db: Db,
  permissionGroupID: string | ObjectId,
  permissionGroup: TypePermissionGroup,
) => {
  const collection = db.collection<TypePermissionGroup>(
    CollectionNames.PermissionGroups,
  )

  return collection.findOneAndUpdate(
    {
      _id: new ObjectId(permissionGroupID.toString()),
      deleted: false,
    },
    {
      $set: {
        ...permissionGroup,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  )
}

const removePermissionGroup = async (
  db: Db,
  permissionGroupID: string | ObjectId,
) => {
  const collection = db.collection<TypePermissionGroup>(
    CollectionNames.PermissionGroups,
  )

  await collection.updateOne(
    {
      _id: new ObjectId(permissionGroupID.toString()),
    },
    {
      $set: {
        deleted: true,
      },
    },
  )
}

const findAndCountPermissionGroups = async (db: Db, params) => {
  const collection = db.collection<TypePermissionGroup>(
    CollectionNames.PermissionGroups,
  )

  const { limit, offset, sortBy, sortOrder } = params

  const pipeline = []

  // Match
  pipeline.push({
    $match: {
      deleted: false,
      ...(isDefined(params.search) && {
        $or: [searchAttributeString('name', params.search)],
      }),
      ...(isDefined(params.name) &&
        getQueryExactlyAttributeString('name', params.name)),
      ...(isDefined(params.default) && {
        default: params.default,
      }),
      ...(isDefined(params.permissionGroupIDs) && {
        'permissionGroups._id': {
          $in: params.permissionGroupIDs.map(id => new ObjectId(id.toString())),
        },
      }),
    },
  })

  const paginationPipeline = buildPaginationPipeline({
    offset,
    limit,
    sortBy,
    sortOrder,
  })

  pipeline.push({ $project: { password: 0 } })

  const result = await collection
    .aggregate([...pipeline, ...paginationPipeline])
    .toArray()
  const [resultCount] = await collection
    .aggregate([...pipeline, { $count: 'count' }])
    .toArray()

  return { result, count: resultCount?.count || 0 }
}

export {
  findByPermissionGroupID,
  findByPermissionGroupIDs,
  findDefaultPermissionGroups,
  insertPermissionGroup,
  updatePermissionGroup,
  removePermissionGroup,
  findAndCountPermissionGroups,
}
