import { NextFunction, Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { HttpStatus } from '../../types/global.enums'
import { findByRefreshToken } from './tokens.dao'

const validateTokenExistence = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, body } = request

  try {
    const { refreshToken } = body

    const tokensData = await findByRefreshToken(db, refreshToken)

    if (!tokensData) {
      throw new AppError(messages.errors.tokens[404], null, HttpStatus.NotFound)
    }

    request.locals.tokens = tokensData

    return next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.tokens.GET[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

export { validateTokenExistence }
