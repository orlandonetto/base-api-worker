import { Db, ObjectId } from 'mongodb'

import { isDefined, isDefinedOrNull } from '../../helpers/object-helper'
import {
  buildPaginationPipeline,
  getQueryContainsAttributeString,
  getQueryStartWithAttributeString,
  searchAttributeString,
} from '../../helpers/query-helper'
import { CollectionNames } from '../../types/global.enums'
import { TypePerson } from './people.types'

const findPersonByID = async (db: Db, personID: string | ObjectId) => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  return collection.findOne(
    {
      _id: new ObjectId(personID.toString()),
      deleted: false,
    },
    { projection: { password: 0 } },
  )
}

const insertPerson = async (db: Db, person: TypePerson) => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  const { insertedId } = await collection.insertOne(person)
  const personID = insertedId.toString()

  return findPersonByID(db, personID)
}

const findAndCountPeople = async (db: Db, params) => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  const { limit, offset, sortBy, sortOrder } = params

  const pipeline = []

  // Match
  pipeline.push({
    $match: {
      deleted: false,
      ...(isDefined(params.search) && {
        $or: [
          searchAttributeString('name', params.search),
          searchAttributeString('email', params.search),
        ],
      }),
      ...(isDefined(params.name) &&
        getQueryContainsAttributeString('name', params.name)),
      ...(isDefined(params.email) &&
        getQueryStartWithAttributeString('email', params.email)),
      ...(isDefined(params.cpf) &&
        getQueryContainsAttributeString('cpf', params.cpf)),
      ...(isDefined(params.phone) &&
        getQueryContainsAttributeString('phone', params.phone)),
      ...(isDefined(params.language) && {
        language: params.language,
      }),
      ...(isDefined(params.permissionGroupIDs) && {
        'permissionGroups._id': {
          $in: params.permissionGroupIDs.map(id => new ObjectId(id.toString())),
        },
      }),
    },
  })

  const paginationPipeline = buildPaginationPipeline({
    offset,
    limit,
    sortBy,
    sortOrder,
  })

  pipeline.push({ $project: { password: 0 } })

  const result = await collection
    .aggregate([...pipeline, ...paginationPipeline])
    .toArray()
  const [resultCount] = await collection
    .aggregate([...pipeline, { $count: 'count' }])
    .toArray()

  return { result, count: resultCount?.count || 0 }
}

const updatePerson = async (db: Db, personID: string, person: TypePerson) => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  const $set = {
    ...(isDefined(person.name) && {
      name: person.name,
    }),
    ...(isDefined(person.email) && {
      email: person.email,
    }),
    ...(isDefinedOrNull(person.photo) && {
      photo: person.photo,
    }),
    ...(isDefined(person.language) && {
      language: person.language,
    }),
    ...(isDefined(person.permissionGroups) && {
      permissionGroups: person.permissionGroups,
    }),
    ...(isDefined(person.password) && {
      password: person.password,
    }),
    ...(isDefined(person.cpf) && {
      cpf: person.cpf,
    }),
    ...(isDefined(person.phone) && {
      phone: person.phone,
    }),
    ...(isDefined(person.birthDate) && {
      birthDate: person.birthDate,
    }),
    ...(isDefined(person.gender) && {
      gender: person.gender,
    }),
    ...(isDefined(person.address) && {
      address: person.address,
    }),
    updatedAt: new Date(),
  }

  await collection.updateOne(
    {
      _id: new ObjectId(personID),
      deleted: false,
    },
    { $set },
  )

  return findPersonByID(db, personID)
}

const deletePerson = async (db: Db, personID: string) => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  return collection.updateOne(
    {
      _id: new ObjectId(personID),
      deleted: false,
    },
    { $set: { deleted: true } },
  )
}

const findPersonByEmail = async (db: Db, email: string) => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  return collection.findOne(
    {
      email,
      deleted: false,
    },
    { projection: { password: 0 } },
  )
}

const findPersonCredentials = async (
  db: Db,
  email: string,
): Promise<TypePerson> => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  return collection.findOne(
    {
      email,
      deleted: false,
    },
    { projection: { email: 1, password: 1 } },
  )
}

const findPeopleByIDs = async (db: Db, personIDs: string[]) => {
  const collection = db.collection<TypePerson>(CollectionNames.People)

  return collection
    .find(
      {
        _id: { $in: personIDs.map(id => new ObjectId(id)) },
      },
      { projection: { password: 0 } },
    )
    .toArray()
}

const findPersonByCPF = async (db: Db, cpf: string) => {
  return db.collection<TypePerson>(CollectionNames.People).findOne({
    deleted: false,
    cpf: {
      $regex: `^${cpf.replace(/[^\d]/g, '')}$`,
    },
  })
}

export {
  insertPerson,
  findPersonByID,
  findAndCountPeople,
  updatePerson,
  deletePerson,
  findPersonByEmail,
  findPeopleByIDs,
  findPersonCredentials,
  findPersonByCPF,
}
