import jwt from 'jsonwebtoken'
import moment from 'moment'
import { Db, ObjectId } from 'mongodb'
import { v4 as uuid } from 'uuid'

import config from '../../config'
import { separateNumbersAndLetters } from '../../helpers/string-helper'
import { insertToken } from './tokens.dao'

const verifyToken = (token, secret = config.jwt.secret) => {
  token = `${token}`.replace('Bearer ', '')

  return jwt.verify(token, secret)
}

const generateToken = (
  payload,
  secret = config.jwt.secret,
  expiration = config.jwt.expiration,
) => {
  const options = {
    expiresIn: expiration || config.jwt.expiration || '1h',
  }
  return jwt.sign(
    { ...payload, timestamp: new Date().getTime() },
    secret || config.jwt.secret,
    options,
  )
}

const generateExpiresIn = (expiration = config.jwt.expirationRefresh) => {
  const { numbers: amount, letters: unit } =
    separateNumbersAndLetters(expiration)

  return moment()
    .add(amount, unit || 'milliseconds')
    .toDate()
}

const generateRefreshToken = () => {
  return uuid().replace(/-/g, '')
}

const generateLoginTokensData = async (
  db: Db,
  personID: string | ObjectId,
  tenantID: string,
) => {
  const accessToken = generateToken({ personID, tenantID })
  const refreshToken = generateRefreshToken()

  const payload = {
    accessToken,
    refreshToken,
    personID: new ObjectId(personID.toString()),
    expiresIn: generateExpiresIn(),
  }

  await insertToken(db, payload)

  return {
    accessToken,
    refreshToken,
  }
}

const decodeToken = (token: string) => {
  return jwt.decode(token)
}

export {
  verifyToken,
  generateToken,
  generateRefreshToken,
  generateExpiresIn,
  generateLoginTokensData,
  decodeToken,
}
