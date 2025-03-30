import { ObjectId } from 'mongodb'

type TypeAuditLog = {
  _id?: string
  collection: string
  topic?: string
  personID?: ObjectId
  from?: string
  to?: string
  createdAt?: Date
}

export { TypeAuditLog }
