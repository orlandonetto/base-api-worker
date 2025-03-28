import { TypeRequestData } from '../../types/global.types'
import { TypeAuditLog } from './audit-logs.types'

const mapAuditLog = (data: TypeRequestData): TypeAuditLog => {
  return {
    personID: data.personID,
    from: data.from,
    to: data.to,
    createdAt: new Date(),
  }
}

export { mapAuditLog }
