import { ObjectId } from 'mongodb'

type TypeToken = {
  _id?: ObjectId
  accessToken: string
  refreshToken: string
  personID: ObjectId
  expiresIn: Date
}

type TypeAuthorizationTokenData = {
  personID: string
  tenantID: string
}

export { TypeToken, TypeAuthorizationTokenData }
