import { NextFunction, Request, Response } from 'express'

import AppError from '../errors/AppError'
import { containsPermission } from '../helpers/permissions-helper'
import {
  HttpStatus,
  PermissionLogicOperator,
  Permissions,
} from '../types/global.enums'

const validatePermissions =
  (
    permissions: Permissions[],
    op: PermissionLogicOperator = PermissionLogicOperator.And,
  ) =>
  (request: Request, _: Response, next: NextFunction) => {
    const { messages, person } = request

    const hasPermission = containsPermission(
      permissions,
      person.permissions,
      op,
    )
    if (hasPermission) {
      return next()
    }

    throw new AppError(
      messages.errors.permissions[403],
      null,
      HttpStatus.Forbidden,
    )
  }

export { validatePermissions }
