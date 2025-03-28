import { Db } from 'mongodb'
import request from 'supertest'

import {
  insertMockData,
  dropMockData,
  getDBConnections,
  connection,
  defineDefaultAuthorizationData,
  insertTenantsMockData,
  dropTenantsMockData,
} from '../../../test/utils'
import app from '../../app'
import * as helper from '../../helpers/object-helper'
import * as dao from './permission-groups.dao'

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

describe('[POST] - /permission-groups', () => {
  const requestBody = {
    name: 'Create Permission Group',
    permissions: [
      {
        module: 'people',
        active: true,
        permissions: ['people.create'],
      },
    ],
  }

  it('should return 201 when is a valid request', async () => {
    const response = await request(app)
      .post('/permission-groups')
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    expect(response.body).toHaveProperty('name', requestBody.name)
    expect(response.body).toHaveProperty(
      'permissions',
      expect.arrayContaining([
        expect.objectContaining(requestBody.permissions[0]),
      ]),
    )
  })

  it('should return 400 with invalid request body attributes', async () => {
    const response = await request(app)
      .post('/permission-groups')
      .set(AuthorizationData)
      .send({
        any_value: 'invalid_value',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(dao, 'insertPermissionGroup').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .post('/permission-groups')
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[GET] - /permission-groups', () => {
  it('should return 200 with params', async () => {
    const query = {
      name: 'Master',
    }

    const response = await request(app)
      .get('/permission-groups')
      .query(query)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(0)

    const permissionGroups = response.body
    permissionGroups.forEach(p => {
      expect(p).toHaveProperty('_id')
      expect(p.name).toContain(query.name)
    })
  })

  it('should return 200 without params', async () => {
    const query = {}

    const response = await request(app)
      .get('/permission-groups')
      .query(query)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(1)
  })

  it('should return 200 with pagination params', async () => {
    const query = {
      limit: 1,
      offset: 0,
      sortBy: 'name',
      sortOrder: 'asc',
    }

    const response = await request(app)
      .get('/permission-groups')
      .query(query)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(Number(response.headers['x-count'])).toBeGreaterThan(query.limit)
    expect(response.body.length).toBe(query.limit)
  })

  it('should return 400 with invalid params', async () => {
    const response = await request(app)
      .get('/permission-groups')
      .set(AuthorizationData)
      .query({
        value: 'invalid',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest
      .spyOn(dao, 'findAndCountPermissionGroups')
      .mockImplementationOnce(() => {
        throw new Error()
      })

    const response = await request(app)
      .get('/permission-groups')
      .set(AuthorizationData)
      .query({})

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[GET] - /permission-groups/:permissionGroupID', () => {
  it('should return 200 with params', async () => {
    const id = '65d9f72b468ad449f5f5b451'

    const response = await request(app)
      .get(`/permission-groups/${id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', id)
    expect(response.body).toHaveProperty('name')
  })

  it('should return 400 with invalid param', async () => {
    const value = 'invalid value'

    const response = await request(app)
      .get(`/permission-groups/${value}`)
      .set(AuthorizationData)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 with not exists id', async () => {
    const id = '649c42df4d6daf5a88bfde15'

    const response = await request(app)
      .get(`/permission-groups/${id}`)
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
      .get(`/permission-groups/${id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[PUT] - /permission-groups/:permissionGroupID', () => {
  const permissionGroupID = '65d9fd80f8bd71390ec3f04e'

  const requestBody = {
    name: 'Tester name edit',
    permissions: [
      {
        module: 'people',
        active: true,
        permissions: ['people.create', 'people.edit', 'people.delete'],
      },
    ],
  }

  it('should return 200 with all params', async () => {
    const response = await request(app)
      .put(`/permission-groups/${permissionGroupID}`)
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', permissionGroupID)
    expect(response.body).toHaveProperty('name', requestBody.name)
    expect(response.body.permissions).toStrictEqual(
      expect.arrayContaining(requestBody.permissions),
    )
  })

  it('should return 400 with invalid request body attributes', async () => {
    const response = await request(app)
      .put(`/permission-groups/${permissionGroupID}`)
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
      .put(`/permission-groups/${nonExistentId}`)
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(dao, 'updatePermissionGroup').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .put(`/permission-groups/${permissionGroupID}`)
      .set(AuthorizationData)
      .send(requestBody)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[DELETE] - /permission-groups/:permissionGroupID', () => {
  const permissionGroupID = '65d9fd80f8bd71390ec3f04e'

  it('should return 204 with delete permission group', async () => {
    const response = await request(app)
      .delete(`/permission-groups/${permissionGroupID}`)
      .set(AuthorizationData)

    expect(response.status).toBe(204)
  })

  it('should return 400 with invalid id', async () => {
    const invalid_id = 'invalid_id'

    const response = await request(app)
      .delete(`/permission-groups/${invalid_id}`)
      .set(AuthorizationData)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 with not exists id', async () => {
    const nonExistentId = '649ca43ab949464d896bd54e'

    const response = await request(app)
      .delete(`/permission-groups/${nonExistentId}`)
      .set(AuthorizationData)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    const permissionGroupID = '65d9fd7b83bbd487fdef2d66'

    jest.spyOn(dao, 'removePermissionGroup').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .delete(`/permission-groups/${permissionGroupID}`)
      .set(AuthorizationData)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})
