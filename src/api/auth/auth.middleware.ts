import { Joi, Segments, celebrate } from 'celebrate'
import { NextFunction, Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { cpf } from '../../helpers/validations-helper'
import { HttpStatus, Languages } from '../../types/global.enums'
import { addressBaseSchema } from '../people/people.middleware'
import { findByPermissionGroupIDs } from '../permission-groups/permission-groups.dao'

const validateLocalAuthSchema = celebrate({
  [Segments.BODY]: {
    email: Joi.string().required(),
    password: Joi.string().required(),
  },
})

const validateLocalSignUpSchema = celebrate({
  [Segments.BODY]: {
    email: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    cpf: cpf(Joi).required(),
    phone: Joi.string().required(),
    photo: Joi.string().allow(null).optional(),
    language: Joi.string()
      .valid(...Object.values(Languages))
      .default(Languages.Brazilian),
    birthDate: Joi.date().required(),
    gender: Joi.string().optional(),
    address: Joi.object(addressBaseSchema).optional(),
  },
})

const validateRefreshTokenSchema = celebrate({
  [Segments.BODY]: {
    refreshToken: Joi.string().required(),
  },
})

const validateEditProfileSchema = celebrate({
  [Segments.BODY]: {
    password: Joi.string().optional(),
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    photo: Joi.string().allow(null).optional(),
    language: Joi.string()
      .valid(...Object.values(Languages))
      .optional(),
    gender: Joi.string().optional(),
    address: Joi.object(addressBaseSchema).optional(),
  },
})

const validateDeleteProfile = celebrate({
  [Segments.QUERY]: {},
})

const validateIsAdmin = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, person } = request

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
    throw new AppError(messages.errors[401], null, HttpStatus.Unauthorized)
  }

  return next()
}

const validatePersonPhoto = (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { file } = request

  if (!file) {
    return next()
  }

  // Verifica se o arquivo é uma imagem
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError(
      'Formato de arquivo inválido! Use jpeg, jpg ou png.',
      null,
      HttpStatus.BadRequest,
    )
  }

  // Verifica se o tamanho do arquivo é menor que 5MB
  const maxFileSize = 5 * 1024 * 1024
  if (file.size > maxFileSize) {
    throw new AppError(
      'Tamanho do arquivo muito grande! O tamanho máximo de 10MB.',
      null,
      HttpStatus.BadRequest,
    )
  }

  next()
}

export {
  validateLocalAuthSchema,
  validateLocalSignUpSchema,
  validateRefreshTokenSchema,
  validateEditProfileSchema,
  validateDeleteProfile,
  validateIsAdmin,
  validatePersonPhoto,
}
