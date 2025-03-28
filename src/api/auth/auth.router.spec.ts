import { Db, ObjectId } from 'mongodb'
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
import * as dateHelper from '../../helpers/date-helper'
import { CollectionNames } from '../../types/global.enums'
import * as peopleDAO from '../people/people.dao'
import * as tokensDAO from '../tokens/tokens.dao'
import * as tokensHelper from '../tokens/tokens.helper'

let AuthorizationData
let UnauthenticatedData
let Databases: { db: Db; tenantsDB: Db }

beforeAll(async () => {
  app.locals.mongo = await connection()
  Databases = getDBConnections(app.locals.mongo)
  await insertTenantsMockData(Databases.tenantsDB)
  await insertMockData(Databases.db)
  AuthorizationData = await defineDefaultAuthorizationData(Databases.db)
  UnauthenticatedData = { 'x-tenant-id': AuthorizationData['x-tenant-id'] }
})

afterAll(async () => {
  await dropTenantsMockData(Databases.tenantsDB)
  await dropMockData(Databases.db)
  await app.locals.mongo.close(true)
})

const validateResponsePersonSchema = person => {
  expect(person).toStrictEqual(
    expect.objectContaining({
      _id: expect.any(String),
      deleted: expect.any(Boolean),
      email: expect.any(String),
      name: expect.any(String),
      cpf: expect.any(String),
      phone: expect.any(String),
      language: expect.any(String),
      birthDate: expect.any(String),
      permissions: expect.any(Array),
      permissionGroups: expect.any(Array),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      photo: person.photo?.length ? expect.any(String) : null,
    }),
  )
}

describe('[POST] - /auth/local/sign-up', () => {
  const payload = {
    email: 'john.test@test.com',
    name: 'John Test',
    password: 'shhhhh',
    photo: null,
    cpf: '593.836.160-59',
    phone: '81999999999',
    language: 'pt-BR',
    birthDate: '2000-01-01',
  }

  it('should return 201 when created', async () => {
    const response = await request(app)
      .post('/auth/local/sign-up')
      .set(UnauthenticatedData)
      .send(payload)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
    expect(response.body).toHaveProperty('person')
    expect(response.body.person.password).toBeUndefined()

    validateResponsePersonSchema(response.body.person)
  })

  it('should return 400 with invalid body', async () => {
    const response = await request(app)
      .post('/auth/local/sign-up')
      .set(UnauthenticatedData)
      .send({
        invalid: 'any_value',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 400 with not majority', async () => {
    jest.spyOn(dateHelper, 'isMajority').mockReturnValueOnce(false)

    const response = await request(app)
      .post('/auth/local/sign-up')
      .set(UnauthenticatedData)
      .send({ ...payload, email: 'test.majority@email.com' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 409 when person is duplicated', async () => {
    const requestBody = {
      ...payload,
      email: 'person.duplicated@email.com',
    }
    const response1 = await request(app)
      .post('/auth/local/sign-up')
      .set(UnauthenticatedData)
      .send(requestBody)

    expect(response1.status).toBe(201)

    const response2 = await request(app)
      .post('/auth/local/sign-up')
      .set(UnauthenticatedData)
      .send(requestBody)

    expect(response2.status).toBe(409)
    expect(response2.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(peopleDAO, 'insertPerson').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .post('/auth/local/sign-up')
      .set(UnauthenticatedData)
      .send({ ...payload, email: 'test500@error.com' })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[POST] - /auth/local', () => {
  const payload = {
    email: 'john.doe@test.com',
    password: 'Teste123',
  }

  it('should return 200 when logged', async () => {
    const response = await request(app)
      .post('/auth/local')
      .set(UnauthenticatedData)
      .send(payload)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
    expect(response.body).toHaveProperty('person')
    expect(response.body.person).toHaveProperty('permissions')
    expect(response.body.person.password).toBeUndefined()
  })

  it('should return 401 when person is not found by password', async () => {
    const response = await request(app)
      .post('/auth/local')
      .set(UnauthenticatedData)
      .send({ ...payload, password: 'wrong-password' })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 when person is not found by email', async () => {
    const response = await request(app)
      .post('/auth/local')
      .set(UnauthenticatedData)
      .send({ ...payload, email: 'not-found@email.com' })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(tokensDAO, 'insertToken').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .post('/auth/local')
      .set(UnauthenticatedData)
      .send(payload)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[POST] - /auth/local/admin', () => {
  const adminUserpayload = {
    email: 'john.doe@test.com',
    password: 'Teste123',
  }

  const userPayload = {
    email: 'james.bond@test.com',
    password: 'Teste123',
  }

  it('should return 200 when logged', async () => {
    const response = await request(app)
      .post('/auth/local/admin')
      .set(UnauthenticatedData)
      .send(adminUserpayload)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
    expect(response.body).toHaveProperty('person')
    expect(response.body.person).toHaveProperty('permissions')
    expect(response.body.person.password).toBeUndefined()
  })

  it('should return 401 when person is not found by password', async () => {
    const response = await request(app)
      .post('/auth/local/admin')
      .set(UnauthenticatedData)
      .send({ ...adminUserpayload, password: 'wrong-password' })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 when person is not found by email', async () => {
    const response = await request(app)
      .post('/auth/local/admin')
      .set(UnauthenticatedData)
      .send({ ...adminUserpayload, email: 'not-found@email.com' })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(tokensDAO, 'insertToken').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .post('/auth/local/admin')
      .set(UnauthenticatedData)
      .send(adminUserpayload)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 401 when person is not admin', async () => {
    const response = await request(app)
      .post('/auth/local/admin')
      .set(UnauthenticatedData)
      .send(userPayload)

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[PUT] - /auth/refresh', () => {
  it('should return 200 and tokens with valid refresh token', async () => {
    const defaultAccessToken = 'accessToken1'
    const defaultRefreshToken = 'refreshToken1'

    const authorizationData = {
      ...AuthorizationData,
      Authorization: `Bearer ${defaultAccessToken}`,
    }

    const payload = {
      refreshToken: defaultRefreshToken,
    }

    const response = await request(app)
      .put('/auth/refresh')
      .set(authorizationData)
      .send(payload)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
    expect(response.body).toHaveProperty('person')
    expect(response.body.person.password).toBeUndefined()
    expect(response.body.person.permissions).toBeDefined()
  })

  it('should return 400 with invalid request body', async () => {
    const response = await request(app)
      .put('/auth/refresh')
      .set(AuthorizationData)
      .send({
        invalid: 'any_value',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 404 with invalid refresh token', async () => {
    const response = await request(app)
      .put('/auth/refresh')
      .set(AuthorizationData)
      .send({
        refreshToken: 'invalid_refresh_token',
      })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest
      .spyOn(tokensHelper, 'generateLoginTokensData')
      .mockImplementationOnce(() => {
        throw new Error()
      })

    const response = await request(app)
      .put('/auth/refresh')
      .set({
        ...AuthorizationData,
        Authorization: `Bearer accessToken2`,
      })
      .send({
        refreshToken: 'refreshToken2',
      })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[GET] - /auth', () => {
  it('should return 200 with valid token', async () => {
    const response = await request(app).get('/auth').set(AuthorizationData)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', expect.any(String))
    expect(response.body).toHaveProperty('name', expect.any(String))
    expect(response.body).toHaveProperty('email', expect.any(String))
    expect(response.body.password).toBeUndefined()
    expect(response.body.permissions).toBeDefined()
    expect(response.body.permissions.length).toBeGreaterThan(0)
  })

  it('should return 401 with invalid token', async () => {
    const authorizationData = {
      ...AuthorizationData,
      Authorization: `Bearer invalid_token`,
    }

    const response = await request(app).get('/auth').set(authorizationData)

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[PUT] - /auth', () => {
  const authenticatedID = '649b8b3599eca595e449856d'
  const authenticatedPersonData = {
    name: 'John Doe',
    photo:
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    language: 'pt-BR',
  }

  it('should return 200 when profile is updated', async () => {
    const payload = {
      name: 'John Updated',
      photo: null,
    }

    const response = await request(app)
      .put('/auth')
      .set(AuthorizationData)
      .send(payload)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', expect.any(String))
    expect(response.body).toHaveProperty('name', payload.name)
    expect(response.body).toHaveProperty('photo', null)
    expect(response.body).toHaveProperty(
      'language',
      authenticatedPersonData.language,
    )
    expect(response.body.password).toBeUndefined()
  })

  it('should return 200 when update password', async () => {
    const payload = {
      password: 'any_password',
    }

    const { db } = Databases
    const collection = db.collection(CollectionNames.People)

    const beforePerson = await collection.findOne({
      _id: new ObjectId(authenticatedID),
    })

    expect(beforePerson).toBeDefined()
    expect(beforePerson.password).toBeDefined()

    const response = await request(app)
      .put('/auth')
      .set(AuthorizationData)
      .send(payload)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id', expect.any(String))
    expect(response.body.password).toBeUndefined()

    const afterPerson = await collection.findOne({
      _id: new ObjectId(authenticatedID),
    })

    expect(afterPerson).toBeDefined()
    expect(afterPerson.password).not.toBe(beforePerson.password)
  })

  it('should return 400 with invalid request body', async () => {
    const response = await request(app)
      .put('/auth')
      .set(AuthorizationData)
      .send({
        invalid: 'any_value',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(peopleDAO, 'updatePerson').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app)
      .put('/auth')
      .set(AuthorizationData)
      .send({
        name: 'John Error',
      })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[DELETE] - /auth/sign-out', () => {
  it('should return 204 with delete tokens', async () => {
    const response = await request(app)
      .delete(`/auth/sign-out`)
      .set(AuthorizationData)

    expect(response.status).toBe(204)
  })

  it('should return 500 with unexpected error ocurred', async () => {
    jest
      .spyOn(tokensDAO, 'removeTokenByPersonID')
      .mockImplementationOnce(() => {
        throw new Error()
      })

    const response = await request(app)
      .delete(`/auth/sign-out`)
      .set(AuthorizationData)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })
})

describe('[DELETE] - /auth', () => {
  const authenticatedID = '649b8b3599eca595e449856d'

  it('should return 500 with unexpected error ocurred', async () => {
    jest.spyOn(peopleDAO, 'deletePerson').mockImplementationOnce(() => {
      throw new Error()
    })

    const response = await request(app).delete(`/auth`).set(AuthorizationData)

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message', expect.any(String))
  })

  it('should return 204 when delete profile', async () => {
    const before = await request(app)
      .get(`/people/${authenticatedID}`)
      .set(AuthorizationData)
    expect(before.status).toBe(200)
    expect(before.body._id).toBe(authenticatedID)
    expect(before.body.deleted).toBe(false)

    const response = await request(app).delete(`/auth`).set(AuthorizationData)
    expect(response.status).toBe(204)

    const after = await request(app)
      .get(`/people/${authenticatedID}`)
      .set(AuthorizationData)
    expect(after.status).toBe(401)
    expect(after.body).toHaveProperty('message', expect.any(String))
  })
})
