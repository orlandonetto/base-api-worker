/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any */

declare namespace Express {
  export interface Request {
    messages: import('../../types/global.types').TypeMessages
    db: import('mongodb').Db
    tenantsDB: import('mongodb').Db
    tenantID: string
    company: import('../../api/companies/companies.types').TypeCompany
    person?: import('../../api/people/people.types').TypePerson
    locals: any
    data?: import('../../types/global.types').TypePubSubMessage
  }
}

declare namespace qs {
  export interface ParsedQs {
    [key: string]:
      | string
      | number
      | undefined
      | null
      | string[]
      | ParsedQs
      | ParsedQs[]
    text: string
    label: string
    email: string
    title: string
    flat: boolean
    root: boolean
    module: string
    role: string
    name: string
    limit: number
    offset: number
    groupID: string | null
    personID: string | null
    type: string | null
    status: string | null
    sortBy: string | null
    sortOrder: string | null
  }
}
