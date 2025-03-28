import { Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { isEmpty } from '../../helpers/array-helper'
import { isDefined } from '../../helpers/object-helper'
import { encryptPassword } from '../../helpers/password-helper'
import { HttpStatus } from '../../types/global.enums'
import { findByPermissionGroupID } from '../permission-groups/permission-groups.dao'
import { mapPermissionGroupRef } from '../permission-groups/permission-groups.helper'
import {
  deletePerson,
  findAndCountPeople,
  insertPerson,
  updatePerson,
} from './people.dao'
import { mapPerson } from './people.helper'

const createPerson = async (request: Request, response: Response) => {
  const {
    db,
    company,
    messages,
    body,
    locals: { permissionGroups = [] },
  } = request

  try {
    if (!permissionGroups.length) {
      const defaultPermissionGroups = await findByPermissionGroupID(
        db,
        company.settings?.defaultPermissionGroupID,
      )
      if (defaultPermissionGroups) {
        permissionGroups.push(defaultPermissionGroups)
      }
    }

    const mapped = mapPerson(body, { permissionGroups })

    const person = await insertPerson(db, mapped)

    response.status(HttpStatus.Created).json(person)
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

const fetchPerson = async (request: Request, response: Response) => {
  const { messages, locals } = request

  try {
    const { person } = locals

    response.status(HttpStatus.Ok).json(person)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.people.GET[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

const fetchPeople = async (request: Request, response: Response) => {
  const { db, messages, query } = request

  try {
    const { result, count } = await findAndCountPeople(db, query)

    response.set('x-count', count)

    response.status(HttpStatus.Ok).json(result)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.people.LIST[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

const editPerson = async (request: Request, response: Response) => {
  const {
    db,
    company,
    messages,
    body,
    locals: { permissionGroups = [] },
  } = request

  try {
    const person = request.locals.person || request.person
    const personID = person?._id.toString()

    // Permission Groups
    if (isDefined(body.permissionGroups)) {
      if (isEmpty(body.permissionGroups)) {
        const defaultPermissionGroups = await findByPermissionGroupID(
          db,
          company.settings?.defaultPermissionGroupID,
        )
        if (defaultPermissionGroups) {
          permissionGroups.push(defaultPermissionGroups)
        }
      }

      body.permissionGroups = permissionGroups.map(mapPermissionGroupRef)
    }

    // Password
    if (body.password) {
      body.password = await encryptPassword(body.password)
    }

    const updatedPerson = await updatePerson(db, personID, body)

    response.status(HttpStatus.Ok).json(updatedPerson)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.people.PUT[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

const removePerson = async (request: Request, response: Response) => {
  const { db, messages } = request

  try {
    const person = request.locals.person || request.person
    const personID = person?._id.toString()

    await deletePerson(db, personID)

    response.status(HttpStatus.NoContent).end()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      messages.errors.people.DELETE[500],
      error,
      HttpStatus.InternalServerError,
    )
  }
}

export { createPerson, fetchPerson, fetchPeople, editPerson, removePerson }
