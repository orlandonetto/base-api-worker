import fs from 'fs'
import moment from 'moment'
import { Db, MongoClient, ObjectId } from 'mongodb'
import path from 'path'

import { generateLoginTokensData } from '../../src/api/tokens/tokens.helper'
import config from '../../src/config'
import { isDefined } from '../../src/helpers/object-helper'
import { connect } from '../../src/services/mongo'
import { CollectionNames } from '../../src/types/global.enums'

const connection = async () => {
  const { options, host } = config.mongo
  return connect({ host, options })
}

const getDBConnections = (
  dbConnection: MongoClient,
): { db: Db; tenantsDB: Db } => {
  return {
    db: dbConnection.db(config.mongo.mockDBName),
    tenantsDB: dbConnection.db(config.mongo.mockTenantsDBName),
  }
}

const mapMockData = e => ({
  ...e,
  ...(isDefined(e._id) && {
    _id: new ObjectId(e._id),
  }),
  ...(isDefined(e.id) && {
    id: new ObjectId(e.id),
  }),
  ...(isDefined(e.externalID) && {
    externalID: new ObjectId(e.externalID),
  }),
  ...(isDefined(e.personID) && {
    personID: new ObjectId(e.personID),
  }),
  ...(isDefined(e.entityID) && {
    entityID: new ObjectId(e.entityID),
  }),
  ...(!!e.createdAt && {
    createdAt: moment(e.createdAt).toDate(),
  }),
  ...(!!e.updatedAt && {
    updatedAt: moment(e.updatedAt).toDate(),
  }),
  ...(!!e.startedAt && {
    startedAt: moment(e.startedAt).toDate(),
  }),
  ...(!!e.finishedAt && {
    finishedAt: moment(e.finishedAt).toDate(),
  }),
  ...(isDefined(e.person) && {
    person: {
      ...e.person,
      _id: new ObjectId(e.person._id),
    },
  }),
  ...(isDefined(e.creator) && {
    creator: {
      ...e.creator,
      _id: new ObjectId(e.creator._id),
    },
  }),
  ...(isDefined(e.owner) && {
    owner: {
      ...e.owner,
      _id: new ObjectId(e.owner._id),
    },
  }),
  ...(isDefined(e.options) && {
    options: e.options.map(o => ({
      ...o,
      _id: new ObjectId(o._id),
    })),
  }),
  ...(isDefined(e.items) && {
    items: e.items.map(i => ({
      ...i,
      ...(isDefined(i._id) && {
        _id: new ObjectId(i._id),
      }),
      ...(isDefined(i.item) && {
        item: {
          ...i.item,
          _id: new ObjectId(i.item._id),
        },
      }),
    })),
  }),
})

const createIndexesMockData = async (
  db: Db,
  collectionName: CollectionNames,
) => {
  try {
    const filePath = path.join(
      process.cwd(),
      'test',
      'indexes',
      `${collectionName}.json`,
    )

    if (!fs.existsSync(filePath)) {
      return
    }

    const file = fs.readFileSync(filePath, { encoding: 'utf-8' })
    const fileParsed = JSON.parse(file)

    const promises = fileParsed.map(({ keys, options }) =>
      db.collection(collectionName).createIndex(keys, options),
    )

    await Promise.all(promises)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error.message)
  }
}

const processSeederFiles = async (db: Db, mockPath: string) => {
  // Lê todos os arquivos dentro da pasta de seeders
  const files = fs.readdirSync(mockPath)

  for await (const file of files) {
    // Ignora arquivos que não são JSON
    if (!file.endsWith('.json')) continue

    // Lê o conteúdo do arquivo JSON
    const mockDataFile = fs.readFileSync(path.join(mockPath, file))
    const mockData = JSON.parse(mockDataFile.toString())

    try {
      const collectionName = file.slice(0, -5) // remove .json from filename
      const collection = db.collection(collectionName)

      const mappedMockData = mockData.map(mapMockData)

      await collection.insertMany(mappedMockData)
      await createIndexesMockData(db, collectionName as CollectionNames)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(
        `Falha ao inserir os dados da collection do arquivo ${file}.`,
        error,
      )
    }
  }
}

const insertTenantsMockData = async (tenantsDB: Db) => {
  const mockTenantsPath = path.join(__dirname, '/../seeders/tenants')
  await processSeederFiles(tenantsDB, mockTenantsPath)
}

const dropTenantsMockData = async (tenantsDB: Db) => {
  await tenantsDB.dropDatabase()
}

const insertMockData = async (db: Db) => {
  const mockPath = path.join(__dirname, '/../seeders')
  await processSeederFiles(db, mockPath)
}

const dropMockData = async (db: Db) => {
  await db.dropDatabase()
}

const defineDefaultAuthorizationData = async (
  db: Db,
  personID = '649b8b3599eca595e449856d',
  tenantID = config.mongo.mockDBName,
) => {
  const { accessToken } = await generateLoginTokensData(db, personID, tenantID)

  return {
    Authorization: accessToken,
    'x-tenant-id': tenantID,
  }
}

export {
  connection,
  getDBConnections,
  insertTenantsMockData,
  dropTenantsMockData,
  insertMockData,
  dropMockData,
  defineDefaultAuthorizationData,
  createIndexesMockData,
}
