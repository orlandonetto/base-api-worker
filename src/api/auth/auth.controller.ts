import { Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { isMajority } from '../../helpers/date-helper'
import { comparePassword, encryptPassword } from '../../helpers/password-helper'
import { processFileURL } from '../../services/google/storage'
import { HttpStatus } from '../../types/global.enums'
import {
  findPersonByID,
  findPersonCredentials,
  insertPerson,
} from '../people/people.dao'
import { mapPerson, mapPersonPermissions } from '../people/people.helper'
import {
  findByPermissionGroupID,
  findByPermissionGroupIDs,
} from '../permission-groups/permission-groups.dao'
import { removeToken, removeTokenByPersonID } from '../tokens/tokens.dao'
import { generateLoginTokensData } from '../tokens/tokens.helper'

const localSignUp = async (request: Request, response: Response) => {
  const {
    db,
    file,
    company,
    tenantID,
    messages,
    body,
    locals: { permissionGroups = [] },
  } = request

  try {
    const { settings } = company

    if (settings?.requiredMajority) {
      const { birthDate } = body

      if (!birthDate || !isMajority(birthDate)) {
        throw new AppError(
          messages.errors.people.validations.requiredMajority,
          null,
          HttpStatus.BadRequest,
        )
      }
    }

    body.password = await encryptPassword(body.password)

    if (file) {
      const filename = `pp_${Date.now()}`
      body.photo = await processFileURL(filename, file, company.credentials)
    }

    if (!permissionGroups.length && !!settings?.defaultPermissionGroupID) {
      const defaultPermissionGroup = await findByPermissionGroupID(
        db,
        settings.defaultPermissionGroupID,
      )
      if (defaultPermissionGroup) {
        permissionGroups.push(defaultPermissionGroup)
      }
    }

    const mapped = mapPerson(body, { permissionGroups })
    const person = await insertPerson(db, mapped)
    const personID = person._id.toString()

    person.permissions = await mapPersonPermissions(db, person)

    // Generating tokens and persisting in database
    const { accessToken, refreshToken } = await generateLoginTokensData(
      db,
      personID,
      tenantID,
    )

    const responseBody = {
      accessToken,
      refreshToken,
      person,
    }

    response.status(HttpStatus.Created).json(responseBody)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.auth.local.signUp[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

const localAuth = async (request: Request, response: Response) => {
  const { db, tenantID, messages, body } = request

  try {
    const { email } = body

    const personCredentials = await findPersonCredentials(db, email)
    if (!personCredentials) {
      throw new AppError(
        messages.errors.auth.local[404],
        null,
        HttpStatus.NotFound,
      )
    }

    const passwordMatch = await comparePassword(
      body.password,
      personCredentials.password,
    )

    if (!passwordMatch) {
      throw new AppError(
        messages.errors.auth.local[404], // TODO: i18n
        null,
        HttpStatus.Unauthorized,
      )
    }

    const { _id: personID } = personCredentials
    const { accessToken, refreshToken } = await generateLoginTokensData(
      db,
      personID,
      tenantID,
    )

    const person = await findPersonByID(db, personID)

    person.permissions = await mapPersonPermissions(db, person)

    const responseBody = {
      accessToken,
      refreshToken,
      person,
    }

    response.status(HttpStatus.Ok).json(responseBody)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.auth.local[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

const refreshTokens = async (request: Request, response: Response) => {
  const {
    db,
    tenantID,
    messages,
    body,
    locals: { tokens },
  } = request

  try {
    if (tokens.refreshToken !== body.refreshToken) {
      throw new AppError(messages.errors.tokens[404], null, HttpStatus.NotFound)
    }

    const person = await findPersonByID(db, tokens.personID.toString())

    const personID = person._id.toString()
    const tokenID = tokens._id.toString()

    // Generating tokens and persisting in database
    const { accessToken, refreshToken } = await generateLoginTokensData(
      db,
      personID,
      tenantID,
    )

    person.permissions = await mapPersonPermissions(db, person)

    // Desabilitando e removendo token antigo
    await removeToken(db, tokenID)

    const responseBody = {
      accessToken,
      refreshToken,
      person,
    }

    response.status(HttpStatus.Ok).json(responseBody)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.tokens.PUT[500], error, 500)
  }
}

const fetchAuthData = async (request: Request, response: Response) => {
  const { messages, person } = request

  try {
    response.status(HttpStatus.Ok).json(person)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.auth.GET[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

const signOut = async (request: Request, response: Response) => {
  const { db, messages, person } = request

  try {
    const { _id } = person

    await removeTokenByPersonID(db, _id.toString())

    response.status(HttpStatus.NoContent).json()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.tokens.DELETE[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

const localAdminAuth = async (request: Request, response: Response) => {
  const { db, tenantID, messages, body } = request

  try {
    const { email } = body

    const personCredentials = await findPersonCredentials(db, email)
    if (!personCredentials) {
      throw new AppError(
        messages.errors.auth.local[404],
        null,
        HttpStatus.NotFound,
      )
    }

    const passwordMatch = await comparePassword(
      body.password,
      personCredentials.password,
    )

    if (!passwordMatch) {
      throw new AppError(
        messages.errors.auth.local[404],
        null,
        HttpStatus.Unauthorized,
      )
    }

    const { _id: personID } = personCredentials
    const { accessToken, refreshToken } = await generateLoginTokensData(
      db,
      personID,
      tenantID,
    )

    const person = await findPersonByID(db, personID)

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

    if (!isAdmin) {
      throw new AppError(
        messages.errors.auth.local[401],
        null,
        HttpStatus.Unauthorized,
      )
    }

    person.permissions = await mapPersonPermissions(db, person)

    const responseBody = {
      accessToken,
      refreshToken,
      person,
    }

    response.status(HttpStatus.Ok).json(responseBody)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.auth.local[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

export {
  localSignUp,
  localAuth,
  refreshTokens,
  fetchAuthData,
  signOut,
  localAdminAuth,
}
