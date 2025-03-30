import { MongoClient } from 'mongodb'

import { TypeCompany } from '../../src/api/companies/companies.types'
import config from '../../src/config'
import { connect } from '../../src/services/mongo'

const getCompaniesAndConnection = async (): Promise<{
  mongoConnection: MongoClient
  companies: TypeCompany[]
}> => {
  const {
    mongo: { tenantsDBName, options },
  } = config

  const mongoConnection = await connect({
    host: config.mongo.host,
    options,
  })

  const db = mongoConnection.db(tenantsDBName)

  const companies = await db
    .collection<TypeCompany>('companies')
    .find({
      deleted: { $ne: true },
      active: { $ne: false },
    })
    .toArray()

  return { mongoConnection, companies }
}

export { getCompaniesAndConnection }
