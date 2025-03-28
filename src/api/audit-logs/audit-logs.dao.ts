import { Db } from 'mongodb'

import { CollectionNames } from '../../types/global.enums'
import { TypeAuditLog } from './audit-logs.types'

const insertAuditLog = async (db: Db, auditLog: TypeAuditLog) => {
  return db
    .collection<TypeAuditLog>(CollectionNames.AuditLogs)
    .insertOne(auditLog)
}

export { insertAuditLog }
