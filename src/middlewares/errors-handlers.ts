import { NextFunction, Request, Response } from 'express'

import AppError from '../errors/AppError'
import { HttpStatus } from '../types/global.enums'

const exceptionHandler = (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  if (err?.stack && process.env.NODE_ENV !== 'test') {
    console.log(err.stack) // eslint-disable-line no-console
  }

  if (err instanceof AppError) {
    if (err.error?.message) {
      console.log(err.error?.message) // eslint-disable-line no-console
    }

    res.status(err.status).json({ message: err.message })
    return
  }

  // Caso ocorra algum erro inesperado, retornar um erro 500
  res
    .status(HttpStatus.InternalServerError)
    .json({ message: 'Erro interno do servidor' })
}

const notFoundHandler = (req, res, next) => {
  // returns 403 if not found router (default is 404)
  next(new AppError('Forbidden', null, 403))
}

export { exceptionHandler, notFoundHandler }
