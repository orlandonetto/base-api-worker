import { Db, ObjectId } from 'mongodb'

import { CollectionNames } from '../../types/global.enums'
import { TypeToken } from './tokens.types'

const findTokenByID = async (db: Db, tokenID: string) => {
  const collection = db.collection<TypeToken>(CollectionNames.Tokens)

  return collection.findOne({
    _id: new ObjectId(tokenID),
  })
}

const insertToken = async (db: Db, payload: TypeToken) => {
  const collection = db.collection<TypeToken>(CollectionNames.Tokens)

  const { insertedId } = await collection.insertOne(payload)

  return findTokenByID(db, insertedId.toString())
}

const fetchTokens = async (db: Db, params) => {
  const collection = db.collection<TypeToken>(CollectionNames.Tokens)

  return collection
    .find({
      ...(!!params._id && { _id: params._id }),
      ...(!!params.accessToken && { accessToken: params.accessToken }),
      ...(!!params.refreshToken && { refreshToken: params.refreshToken }),
      ...(!!params.personID && { userID: params.personID }),
    })
    .toArray()
}

const findByRefreshToken = async (db: Db, refreshToken: string) => {
  const collection = db.collection<TypeToken>(CollectionNames.Tokens)

  return collection.findOne({
    refreshToken,
  })
}

const removeTokenByPersonID = async (db: Db, personID: string) => {
  const collection = db.collection<TypeToken>(CollectionNames.Tokens)

  return collection.deleteMany({ personID: new ObjectId(personID) })
}

const removeToken = async (db: Db, tokenID: string) => {
  const collection = db.collection<TypeToken>(CollectionNames.Tokens)

  return collection.deleteOne({ _id: new ObjectId(tokenID) })
}

export {
  findTokenByID,
  insertToken,
  fetchTokens,
  findByRefreshToken,
  removeTokenByPersonID,
  removeToken,
}
