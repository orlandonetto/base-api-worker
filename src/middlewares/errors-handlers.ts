import { isCelebrateError } from 'celebrate'
import { NextFunction, Request, Response } from 'express'

import AppError from '../errors/AppError'
import { HttpStatus } from '../types/global.enums'

const exceptionHandler = (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  const { messages } = req

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

  if (isCelebrateError(err)) {
    const message = messages.errors[400]
    const details = Array.from(err.details.entries()).map(
      ([segment, joiError]) => ({
        source: segment,
        keys: joiError.details,
        message: joiError.message,
      }),
    )

    console.log(message) // eslint-disable-line no-console
    details.forEach(detail => console.log(detail)) // eslint-disable-line no-console

    res.status(HttpStatus.BadRequest).json({
      message,
      details,
    })
    return
  }

  // Caso ocorra algum erro inesperado, retornar um erro 500
  res
    .status(HttpStatus.InternalServerError)
    .json({ message: 'Erro interno do servidor' }) // TODO: i18n
}

const notFoundHandler = (req, res, next) => {
  // returns 403 if not found router (default is 404)
  next(new AppError('Forbidden', null, 403))
}

export { exceptionHandler, notFoundHandler }
