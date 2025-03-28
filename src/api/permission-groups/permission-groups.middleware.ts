import { Joi, Segments, celebrate } from 'celebrate'
import { NextFunction, Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { isNullOrUndefined } from '../../helpers/object-helper'
import {
  objectId,
  paginationBaseSchema,
} from '../../helpers/validations-helper'
import { Permissions } from '../../types/global.enums'
import {
  findByPermissionGroupID,
  findByPermissionGroupIDs,
} from './permission-groups.dao'

const paramsBaseSchema = {
  permissionGroupID: objectId(Joi).required(),
}

const permissionModuleSchema = Joi.object({
  module: Joi.string()
    .valid(...Object.values(Permissions))
    .required(),
  active: Joi.boolean().required(),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(Permissions)))
    .required(),
})

const validateCreatePermissionGroupSchema = celebrate({
  [Segments.BODY]: {
    name: Joi.string().required(),
    permissions: Joi.array().items(permissionModuleSchema).required(),
    default: Joi.boolean().optional(),
  },
})

const validateFetchPermissionGroupsSchema = celebrate({
  [Segments.QUERY]: {
    ...paginationBaseSchema,
    name: Joi.string().optional(),
    default: Joi.boolean().optional(),
    permissionGroupIDs: Joi.array().items(objectId(Joi)).optional(),
  },
})

const validateFetchPermissionGroupSchema = celebrate({
  [Segments.PARAMS]: paramsBaseSchema,
})

const validateEditPermissionGroupSchema = celebrate({
  [Segments.PARAMS]: paramsBaseSchema,
  [Segments.BODY]: {
    name: Joi.string().optional(),
    permissions: Joi.array().items(permissionModuleSchema).optional(),
    default: Joi.boolean().optional(),
    admin: Joi.boolean().optional(),
  },
})

const validateDeletePermissionGroupSchema = celebrate({
  [Segments.PARAMS]: paramsBaseSchema,
})

const validatePermissionGroupExistence = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, params, body, query } = request

  try {
    const permissionGroupID =
      params.permissionGroupID ||
      query.permissionGroupID ||
      body.permissionGroupID ||
      body.permissionGroup?._id

    if (isNullOrUndefined(permissionGroupID)) {
      return next()
    }

    const permissionGroup = await findByPermissionGroupID(db, permissionGroupID)

    if (isNullOrUndefined(permissionGroup)) {
      throw new AppError(messages.errors.permissionGroups[404], null, 404)
    }

    request.locals.permissionGroup = permissionGroup

    return next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.permissionGroups[404], error, 500)
  }
}

const validatePermissionGroupsExistence = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, body, query } = request

  try {
    const permissionGroupIDs =
      query.permissionGroupIDs ||
      body.permissionGroupIDs ||
      body.permissionGroups?.map(e => e._id)

    if (!permissionGroupIDs?.length) {
      return next()
    }

    const permissionGroups = await findByPermissionGroupIDs(
      db,
      permissionGroupIDs,
    )

    if (permissionGroups?.length !== permissionGroupIDs.length) {
      throw new AppError(messages.errors.permissionGroups[404], null, 404)
    }

    request.locals.permissionGroups = permissionGroups

    return next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.permissionGroups[404], error, 500)
  }
}

export {
  validateCreatePermissionGroupSchema,
  validateFetchPermissionGroupsSchema,
  validateFetchPermissionGroupSchema,
  validateEditPermissionGroupSchema,
  validateDeletePermissionGroupSchema,
  validatePermissionGroupExistence,
  validatePermissionGroupsExistence,
}
