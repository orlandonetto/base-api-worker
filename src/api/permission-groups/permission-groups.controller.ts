import { Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { HttpStatus } from '../../types/global.enums'
import {
  findAndCountPermissionGroups,
  insertPermissionGroup,
  removePermissionGroup,
  updatePermissionGroup,
} from './permission-groups.dao'
import { mapPermissionGroup } from './permission-groups.helper'

const createPermissionGroup = async (request: Request, response: Response) => {
  const { db, messages, body } = request

  try {
    const mapped = mapPermissionGroup(body)

    const permissionGroup = await insertPermissionGroup(db, mapped)

    response.status(HttpStatus.Created).json(permissionGroup)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.permissionGroups.POST[500], error, 500)
  }
}

const fetchPermissionGroups = async (request: Request, response: Response) => {
  const { db, messages, query } = request
  try {
    const { result, count } = await findAndCountPermissionGroups(db, query)

    response.set('x-count', count)

    response.status(HttpStatus.Ok).json(result)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.permissionGroups.LIST[500], error, 500)
  }
}

const fetchPermissionGroup = async (request: Request, response: Response) => {
  const {
    messages,
    locals: { permissionGroup },
  } = request
  try {
    response.status(HttpStatus.Ok).json(permissionGroup)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.permissionGroups.GET[500], error, 500)
  }
}

const editPermissionGroup = async (request: Request, response: Response) => {
  const {
    db,
    messages,
    body,
    params: { permissionGroupID },
    locals: { permissionGroup },
  } = request
  try {
    const updated = await updatePermissionGroup(db, permissionGroupID, {
      ...permissionGroup,
      ...body,
    })

    response.status(HttpStatus.Ok).json(updated)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.permissionGroups.PUT[500], error, 500)
  }
}

const deletePermissionGroup = async (request: Request, response: Response) => {
  const {
    db,
    messages,
    params: { permissionGroupID },
  } = request
  try {
    await removePermissionGroup(db, permissionGroupID)

    response.status(HttpStatus.NoContent).end()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(messages.errors.permissionGroups.DELETE[500], error, 500)
  }
}

export {
  createPermissionGroup,
  fetchPermissionGroups,
  fetchPermissionGroup,
  editPermissionGroup,
  deletePermissionGroup,
}
