import { celebrate, Joi, Segments } from 'celebrate'
import { NextFunction, Request, Response } from 'express'

import AppError from '../../errors/AppError'
import { isDefined, isNullOrUndefined } from '../../helpers/object-helper'
import {
  cpf,
  objectId,
  paginationBaseSchema,
} from '../../helpers/validations-helper'
import { HttpStatus, Languages } from '../../types/global.enums'
import {
  findPersonByID,
  findPersonByEmail,
  findPeopleByIDs,
  findPersonByCPF,
} from './people.dao'

const paramsBaseSchema = {
  personID: objectId(Joi).required(),
}

const permissionGroupsBaseSchema = {
  _id: objectId(Joi).required(),
  name: Joi.string().optional(),
}

const addressBaseSchema = {
  street: Joi.string().allow(null, '').optional(),
  number: Joi.string().allow(null, '').optional(),
  complement: Joi.string().allow(null, '').optional(),
  neighborhood: Joi.string().allow(null, '').optional(),
  city: Joi.string().allow(null, '').optional(),
  state: Joi.string().allow(null, '').optional(),
  zipCode: Joi.string().allow(null, '').optional(),
  country: Joi.string().allow(null, '').optional(),
}

const validateCreatePersonSchema = celebrate({
  [Segments.BODY]: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    cpf: cpf(Joi).optional(),
    phone: Joi.string().optional(),
    photo: Joi.string().allow(null).optional(),
    language: Joi.string()
      .valid(...Object.values(Languages))
      .default(Languages.Brazilian),
    birthDate: Joi.date().optional(),
    permissionGroups: Joi.array().items(permissionGroupsBaseSchema).optional(),
    gender: Joi.string().optional(),
    address: Joi.object(addressBaseSchema).optional(),
  },
})

const validateFetchPeopleSchema = celebrate({
  [Segments.QUERY]: {
    ...paginationBaseSchema,
    email: Joi.string().email().optional(),
    name: Joi.string().optional(),
    language: Joi.string()
      .valid(...Object.values(Languages))
      .optional(),
    phone: Joi.string().optional(),
    cpf: Joi.string().optional(),
    permissionGroupIDs: Joi.array().items(objectId(Joi)).optional(),
  },
})

const validateFetchPersonSchema = celebrate({
  [Segments.PARAMS]: paramsBaseSchema,
})

const validateEditPersonSchema = celebrate({
  [Segments.PARAMS]: paramsBaseSchema,
  [Segments.BODY]: {
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    name: Joi.string().optional(),
    cpf: cpf(Joi).allow(null).optional(),
    phone: Joi.string().allow(null).optional(),
    photo: Joi.string().allow(null).optional(),
    language: Joi.string()
      .valid(...Object.values(Languages))
      .optional(),
    permissionGroups: Joi.array().items(permissionGroupsBaseSchema).optional(),
    birthDate: Joi.date().allow(null).optional(),
    gender: Joi.string().optional(),
    address: Joi.object(addressBaseSchema).optional(),
  },
})

const validateRemovePersonSchema = celebrate({
  [Segments.PARAMS]: paramsBaseSchema,
})

const validateUniquePerson = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const {
    db,
    messages,
    body: { email },
  } = request

  const checkPersonByEmail = await findPersonByEmail(db, email)

  if (isDefined(checkPersonByEmail)) {
    throw new AppError(messages.errors.people[409], null, HttpStatus.Conflict)
  }

  return next()
}

const validatePersonExistence = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, query, params, body } = request

  const personID = params.personID || query.personID || body.personID

  if (isNullOrUndefined(personID)) {
    return next()
  }

  const person = await findPersonByID(db, personID)

  if (isNullOrUndefined(person)) {
    throw new AppError(messages.errors.people[404], null, HttpStatus.NotFound)
  }

  request.locals.person = person

  return next()
}

const validatePeopleExistence = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, body } = request

  const { peopleIDs } = body

  if (isNullOrUndefined(peopleIDs)) {
    return next()
  }

  // isEmpty
  if (Array.isArray(peopleIDs) && peopleIDs.length === 0) {
    request.locals.people = []
    return next()
  }

  const people = await findPeopleByIDs(db, peopleIDs)

  if (isNullOrUndefined(people) || people.length !== peopleIDs.length) {
    throw new AppError(messages.errors.people[404], null, HttpStatus.NotFound)
  }

  request.locals.people = people

  return next()
}

const validateRequesterExistence = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, body } = request

  if (isNullOrUndefined(body.requester)) {
    return next()
  }

  if (isNullOrUndefined(body.requester._id)) {
    return next()
  }

  const person = await findPersonByID(db, body.requester._id)

  if (isNullOrUndefined(person)) {
    throw new AppError(messages.errors.people[404], null, HttpStatus.NotFound)
  }

  request.locals.person = person

  return next()
}

const validatePersonCPFExistence = async (
  request: Request,
  _: Response,
  next: NextFunction,
) => {
  const { db, messages, body } = request

  const { cpf } = body

  if (isNullOrUndefined(cpf)) {
    return next()
  }

  const person = await findPersonByCPF(db, cpf)

  if (isDefined(person)) {
    throw new AppError(messages.errors.people[409], null, HttpStatus.Conflict)
  }

  return next()
}

export {
  addressBaseSchema,
  validateCreatePersonSchema,
  validateFetchPeopleSchema,
  validateFetchPersonSchema,
  validateEditPersonSchema,
  validateRemovePersonSchema,
  validateUniquePerson,
  validatePersonExistence,
  validatePeopleExistence,
  validateRequesterExistence,
  validatePersonCPFExistence,
}
