import { Joi } from 'celebrate'

import { validateCNPJ, validateCPF } from './string-helper'

const paginationBaseSchema = {
  limit: Joi.number().integer().min(1).default(10).max(100).optional(),
  offset: Joi.number().integer().greater(-1).default(0).optional(),
  sortBy: Joi.string().default('_id').optional(),
  search: Joi.string().optional(),
  sortOrder: Joi.string()
    .valid(...['asc', 'desc'])
    .default('desc')
    .optional(),
}

const objectId = joi => joi.string().regex(/^[0-9a-fA-F]{24}$/)

const cpf = joi =>
  joi.string().custom((value, helpers) => {
    if (!validateCPF(value)) {
      return helpers.message('invalid CPF')
    }

    return value.replace(/\D/g, '')
  }, 'CPF validation')

const cnpj = joi =>
  joi.string().custom((value, helpers) => {
    if (!validateCNPJ(value)) {
      return helpers.message('invalid CNPJ')
    }

    return value.replace(/\D/g, '')
  }, 'CNPJ validation')

export { paginationBaseSchema, objectId, cpf, cnpj }
