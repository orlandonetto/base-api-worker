import { NextFunction, Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { HttpStatus } from '../../types/global.enums'
import { insertAuditLog } from '../audit-logs/audit-logs.dao'
import { mapAuditLog } from '../audit-logs/audit-logs.helper'

const processPeoplePost = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, data, messages } = request

  try {
    await insertAuditLog(db, mapAuditLog(data))

    return next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.people.POST[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

export { processPeoplePost }
