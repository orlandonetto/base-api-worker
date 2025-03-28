import { NextFunction, Request, Response } from 'express'

import { findCompanyByTenantID } from '../api/companies/companies.dao'
import { findPersonByID } from '../api/people/people.dao'
import { mapPersonPermissions } from '../api/people/people.helper'
import { verifyToken } from '../api/tokens/tokens.helper'
import { TypeAuthorizationTokenData } from '../api/tokens/tokens.types'
import config from '../config'
import AppError from '../errors/AppError'
import { getMessages } from '../services/i18n'
import {
  HttpStatus,
  UnauthenticatedRoutes,
  AllowedUnauthenticatedRoutes,
} from '../types/global.enums'

const isRootRoute = (path: string) => path === '/'

const isUnauthenticatedRoute = (path: string) =>
  UnauthenticatedRoutes.some(p => path === p)

const isAllowedUnauthenticatedRoute = (path: string, method: string): boolean =>
  AllowedUnauthenticatedRoutes.some(
    (item: { path: string; method: string }) => {
      const pathSplitted = path.split('/')
      const itemSplitted = item.path.split('/')

      if (pathSplitted.length !== itemSplitted.length) {
        return false
      }

      // Verifica se o path da requisição corresponde a uma rota permitida
      const matchPathRoute = itemSplitted.every(
        (itemPath, index) =>
          itemPath === '*' || // * significa qualquer coisa
          itemPath === pathSplitted[index], // Verifica se o itemPath é igual ao pathSplitted
      )

      const isSameMethod = item.method.toUpperCase() === method.toUpperCase()
      return matchPathRoute && isSameMethod
    },
  )
const getTenantsDBName = () => {
  const isTestEnv = config.env === 'test'
  if (isTestEnv) {
    return config.mongo.mockTenantsDBName
  }

  return config.mongo.tenantsDBName
}

const extractHeaders = (
  request: Request,
): { authorization?: string; tenantID?: string } => {
  const { headers } = request

  return {
    ...(!!headers.authorization && {
      authorization: headers.authorization.toString(),
    }),
    ...(!!headers['x-tenant-id'] && {
      tenantID: headers['x-tenant-id'].toString(),
    }),
  }
}

const extractAuthorizationTokenData = (
  token: string,
): TypeAuthorizationTokenData => {
  if (!token) {
    return null
  }

  const { personID, tenantID } = verifyToken(token)
  return { personID, tenantID }
}

const extractAuthorizationData = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const messages = getMessages()

  try {
    const tenantsDBName = getTenantsDBName()
    const tenantsDB = await request.app.locals.mongo.db(tenantsDBName)

    request.messages = messages
    request.tenantsDB = tenantsDB

    const { authorization, tenantID } = extractHeaders(request)

    if (!tenantID) {
      throw new AppError(
        messages.errors.tenants[401],
        null,
        HttpStatus.Unauthorized,
      )
    }
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

    if (isRootRoute(request.path)) {
      return next()
    }

    if (isUnauthenticatedRoute(request.path)) {
      return next()
    }

    const tokenData = extractAuthorizationTokenData(authorization)
    if (!tokenData) {
      if (isAllowedUnauthenticatedRoute(request.path, request.method)) {
        return next()
      }

      throw new AppError(
        messages.errors.tokens[401],
        null,
        HttpStatus.Unauthorized,
      )
    }

    const { personID } = tokenData
    const person = await findPersonByID(db, personID)
    if (!person) {
      throw new AppError(
        messages.errors.people[404],
        null,
        HttpStatus.Unauthorized,
      )
    }

    person.permissions = await mapPersonPermissions(db, person)

    request.messages = getMessages(person.language)
    request.person = person

    return next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors[401], error, HttpStatus.Unauthorized)
  }
}

export { extractAuthorizationData }
