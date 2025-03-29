import { ObjectId } from 'mongodb'

import { TopicNames } from './global.enums'

type TypeMessages = {
  errors?: {
    400: string
    401: string
    403: string
    404: string
    500: string
    message: {
      400: string
    }
    tenants: {
      401: string
      404: string
    }
    company: {
      404: string
    }
    people: {
      POST: {
        500: string
      }
    }
  }
  permissions: {
    people: string
    'people.create': string
    'people.edit': string
    'people.delete': string
    'permission-groups': string
    'permission-groups.create': string
    'permission-groups.edit': string
    'permission-groups.delete': string
  }
}

type TypeAddress = {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

type TypePubSubMessage = {
  topic: TopicNames
  personID: string | ObjectId
  tenantID: string
  from: any // eslint-disable-line @typescript-eslint/no-explicit-any
  to: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { TypeMessages, TypeAddress, TypePubSubMessage }
