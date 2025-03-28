type TypeMessages = {
  errors?: {
    400: string
    401: string
    403: string
    404: string
    500: string
    tenants: {
      401: string
      404: string
    }
    auth: {
      409: string
      local: {
        signUp: {
          500: string
        }
        404: string
        500: string
      }
      GET: {
        500: string
      }
    }
    company: {
      404: string
    }
    people: {
      403: string
      404: string
      409: string
      POST: {
        500: string
      }
      GET: {
        500: string
      }
      LIST: {
        500: string
      }
      PUT: {
        500: string
      }
      DELETE: {
        500: string
      }
      validations: {
        requiredMajority: string
      }
    }
    permissions: {
      403: string
    }
    permissionGroups: {
      404: string
      POST: {
        500: string
      }
      LIST: {
        500: string
      }
      GET: {
        500: string
      }
      PUT: {
        500: string
      }
      DELETE: {
        500: string
      }
    }
    tokens: {
      401: string
      404: string
      409: string
      POST: {
        500: string
      }
      GET: {
        500: string
      }
      LIST: {
        500: string
      }
      PUT: {
        500: string
      }
      DELETE: {
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

export { TypeMessages, TypeAddress }
