import { NextFunction, Request, Response } from 'express'

import { findCompanyByTenantID } from '../api/companies/companies.dao'
import { findPersonByID } from '../api/people/people.dao'
import config from '../config'
import AppError from '../errors/AppError'
import { getMessages } from '../services/i18n'
import { HttpStatus } from '../types/global.enums'

const getTenantsDBName = () => {
  const isTestEnv = config.env === 'test'
  if (isTestEnv) {
    return config.mongo.mockTenantsDBName
  }

  return config.mongo.tenantsDBName
}

const extractAuthorizationData = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const messages = getMessages()

  try {
    const { message } = request.body
    if (!message?.data) {
      throw new AppError(
        messages.errors.message[400],
        null,
        HttpStatus.BadRequest,
      )
    }

    const tenantsDBName = getTenantsDBName()
    const tenantsDB = await request.app.locals.mongo.db(tenantsDBName)

    request.messages = messages
    request.tenantsDB = tenantsDB

    const data = JSON.parse(Buffer.from(message.data, 'base64').toString())
    const { tenantID, personID } = data

    const company = await findCompanyByTenantID(tenantsDB, tenantID)
    if (!company) {
      throw new AppError(
        messages.errors.tenants[404],
        null,
        HttpStatus.Unauthorized,
      )
    }

    request.tenantID = tenantID
    request.company = company

    const db = await request.app.locals.mongo.db(tenantID)
    request.db = db

    if (personID) {
      request.person = await findPersonByID(db, personID)
    }

    request.data = data

    return next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors[401], error, HttpStatus.Unauthorized)
  }
}

const processSendSuccess = (_: Request, response: Response) => {
  response.status(HttpStatus.NoContent).end()
}

export { extractAuthorizationData, processSendSuccess }
