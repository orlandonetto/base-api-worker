import { Db, ObjectId } from 'mongodb'
import request from 'supertest'

import {
  insertMockData,
  dropMockData,
  getDBConnections,
  connection,
  defineDefaultAuthorizationData,
  dropTenantsMockData,
  insertTenantsMockData,
} from '../../../test/utils'
import app from '../../app'
import * as helper from '../../helpers/object-helper'
import { CollectionNames } from '../../types/global.enums'
import * as dao from './people.dao'

let AuthorizationData
let Databases: { db: Db; tenantsDB: Db }

beforeAll(async () => {
  app.locals.mongo = await connection()
  Databases = getDBConnections(app.locals.mongo)
  await insertTenantsMockData(Databases.tenantsDB)
  await insertMockData(Databases.db)
  AuthorizationData = await defineDefaultAuthorizationData(Databases.db)
})

afterAll(async () => {
  await dropTenantsMockData(Databases.tenantsDB)
  await dropMockData(Databases.db)
  await app.locals.mongo.close(true)
})

describe('[POST] - /people', () => {
  const requestBody = {
    email: 'create201@gmail.com',
    password: 'shhhhh',
    name: 'John Create',
    cpf: '207.879.640-93',
    phone: '81999999999',
    language: 'pt-BR',
  }

  it('should return 201 when is a valid request', async () => {
    const defaultPermissionGroupID = '65d9fd7b83bbd487fdef2d66'

    const response = await request(app)
      .post('/people')
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('email', requestBody.email)
    expect(response.body).toHaveProperty('language', requestBody.language)

    const { permissionGroups } = response.body
    const [permissionGroup] = permissionGroups

    expect(permissionGroups).toHaveLength(1)
    expect(permissionGroup._id).toBe(defaultPermissionGroupID)
  })

  it('should return 201 with permissionGroups', async () => {
    const masterPermissionGroupID = '65d9f72b468ad449f5f5b451'

    const payload = {
      ...requestBody,
      email: 'create201.2@test.com',
      permissionGroups: [{ _id: masterPermissionGroupID }],
    }

    const response = await request(app)
      .post('/people')
      .set(AuthorizationData)
      .send(payload)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('email', payload.email)

    const { permissionGroups } = response.body
    const [permissionGroup] = permissionGroups

    expect(permissionGroups).toHaveLength(1)
    expect(permissionGroup._id).toBe(masterPermissionGroupID)
  })

  it('should return 400 with invalid request body attributes', async () => {
    const response = await request(app)
      .post('/people')
      .set(AuthorizationData)
      .send({
        any_value: 'invalid_value',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 403 without permission', async () => {
    const authenticatedID = '649b8b3599eca595e449856d'

    const beforePerson = await Databases.db
      .collection(CollectionNames.People)
      .findOneAndUpdate(
        { _id: new ObjectId(authenticatedID) },
        { $set: { permissionGroups: [] } },
        { returnDocument: 'before' },
      )

    const payload = {
      ...requestBody,
      email: 'test.create.403@test.com',
    }

    const response = await request(app)
      .post('/people')
      .set(AuthorizationData)
      .send(payload)

    expect(response.status).toBe(403)
    expect(response.body).toHaveProperty('message', expect.any(String))

    await Databases.db
      .collection(CollectionNames.People)
      .findOneAndUpdate(
        { _id: new ObjectId(authenticatedID) },
        { $set: { permissionGroups: beforePerson.permissionGroups } },
      )
  })

  it('should return 409 when try create with existent email', async () => {
    const payload = {
      ...requestBody,
      email: 'testUniqueEx1@test.com',
    }

    // creating...
    await request(app).post('/people').set(AuthorizationData).send(payload)

    // duplicating...
    const response = await request(app)
      .post('/people')
      .set(AuthorizationData)
      .send(payload)

    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(dao, 'insertPerson').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .post('/people')
      .set(AuthorizationData)
      .send({
        ...requestBody,
        email: 'test500@email.com',
      })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[GET] - /people', () => {
  it('should return 200 with params', async () => {
    const query = {}

    const response = await request(app)
      .get('/people')
      .query(query)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(0)

    const people = response.body
    people.forEach(people => {
      expect(people).toHaveProperty('_id')
    })
  })

  it('should return 200 without params', async () => {
    const query = {}

    const response = await request(app)
      .get('/people')
      .query(query)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(1)
  })

  it('should return 200 with pagination params', async () => {
    const query = {
      limit: 1,
      offset: 0,
      sortBy: 'email',
      sortOrder: 'asc',
    }

    const response = await request(app)
      .get('/people')
      .query(query)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(Number(response.headers['x-count'])).toBeGreaterThan(query.limit)
    expect(response.body.length).toBe(query.limit)
  })

  it('should return 400 with invalid params', async () => {
    const response = await request(app)
      .get('/people')
      .set(AuthorizationData)
      .query({
        value: 'invalid',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(dao, 'findAndCountPeople').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .get('/people')
      .set(AuthorizationData)
      .query({
        name: 'people 1',
      })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[GET] - /people/:personID', () => {
  it('should return 200 with params', async () => {
    const id = '64cc2945740d79af51c085e7'

    const response = await request(app)
      .get(`/people/${id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', id)
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('email')
  })

  it('should return 400 with invalid param', async () => {
    const value = 'invalid value'

    const response = await request(app)
      .get(`/people/${value}`)
      .set(AuthorizationData)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 with not exists id', async () => {
    const id = '649c42df4d6daf5a88bfde15'

    const response = await request(app)
      .get(`/people/${id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(helper, 'isNullOrUndefined').mockImplementationOnce(() => {
      throw new Error()
    })

    const id = '649c19fbf87504f685de9f70'

    const response = await request(app)
      .get(`/people/${id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[PUT] - /people/:personID', () => {
  const masterPermissionGroupID = '65d9f72b468ad449f5f5b451'
  const defaultPermissionGroupID = '65d9fd7b83bbd487fdef2d66'

  const requestBody = {
    permissionGroups: [{ _id: masterPermissionGroupID }],
    language: 'pt-BR',
  }

  const id = '64cc2945740d79af51c085e7'

  it('should return 200 with all params', async () => {
    const response = await request(app)
      .put(`/people/${id}`)
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', id)
    expect(response.body).toHaveProperty('language', requestBody.language)
    expect(response.body.permissionGroups[0]._id).toBe(masterPermissionGroupID)
  })

  it('should return 200 with empty permissionGroups', async () => {
    // Definindo o permission group como 'master'
    await request(app)
      .put(`/people/${id}`)
      .set(AuthorizationData)
      .send({ permissionGroups: [{ _id: masterPermissionGroupID }] })

    const response = await request(app)
      .put(`/people/${id}`)
      .set(AuthorizationData)
      .send({ permissionGroups: [] })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', id)

    const { permissionGroups } = response.body

    const masterPermissionGroup = permissionGroups.find(
      ({ _id }) => _id === masterPermissionGroupID,
    )
    expect(masterPermissionGroup).toBeFalsy()

    const defaultPermissionGroup = permissionGroups.find(
      ({ _id }) => _id === defaultPermissionGroupID,
    )
    expect(defaultPermissionGroup).toBeTruthy()
  })

  it('should return 400 with invalid request body attributes', async () => {
    const response = await request(app)
      .put(`/people/${id}`)
      .set(AuthorizationData)
      .send({
        any_value: 'invalid_value',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 with not exists id', async () => {
    const nonExistentId = '649ca43ab949464d896bd54e'

    const response = await request(app)
      .put(`/people/${nonExistentId}`)
      .set(AuthorizationData)
      .send({
        ...requestBody,
        language: 'pt-BR',
      })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(dao, 'updatePerson').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .put(`/people/${id}`)
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[DELETE] - /people/:personID', () => {
  const id = '64cc25421c598923524a4f38'

  it('should return 204 with delete person', async () => {
    const response = await request(app)
      .delete(`/people/${id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(204)
  })

  it('should return 400 with invalid id', async () => {
    const invalid_id = 'invalid_id'

    const response = await request(app)
      .delete(`/people/${invalid_id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 with not exists id', async () => {
    const nonExistentId = '649ca43ab949464d896bd54e'

    const response = await request(app)
      .delete(`/people/${nonExistentId}`)
      .set(AuthorizationData)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    const id = '649c1a0ceb77fcd3ca5f6919'

    jest.spyOn(dao, 'deletePerson').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .delete(`/people/${id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})
