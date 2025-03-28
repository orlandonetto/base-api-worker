import { Db } from 'mongodb'
import request from 'supertest'

import {
  insertMockData,
  dropMockData,
  getDBConnections,
  connection,
  dropTenantsMockData,
  insertTenantsMockData,
  convertToPubSubMessage,
} from '../../../test/utils'
import app from '../../app'

let Databases: { db: Db; tenantsDB: Db }

beforeAll(async () => {
  app.locals.mongo = await connection()
  Databases = getDBConnections(app.locals.mongo)
  await insertTenantsMockData(Databases.tenantsDB)
  await insertMockData(Databases.db)
})

afterAll(async () => {
  await dropTenantsMockData(Databases.tenantsDB)
  await dropMockData(Databases.db)
  await app.locals.mongo.close(true)
})

describe('[POST] - /people/post', () => {
  const defaultData = {
    topic: 'people.post',
    personID: '649b8b3599eca595e449856d',
    tenantID: 'base-test',
    from: null,
    to: {
      email: 'create201@gmail.com',
      password: 'shhhhh',
      name: 'John Create',
      cpf: '207.879.640-93',
      phone: '81999999999',
      language: 'pt-BR',
    },
  }

  it('should return 204 with success', async () => {
    const response = await request(app)
      .post('/people/post')
      .send(convertToPubSubMessage(defaultData))

    expect(response.status).toBe(204)
  })
})
