import { ObjectId } from 'mongodb'

import { isDefined } from '../../helpers/object-helper'
import { TypePubSubMessage } from '../../types/global.types'
import { TypeAuditLog } from './audit-logs.types'

const mapAuditLog = (
  data: TypePubSubMessage,
  collection: string,
): TypeAuditLog => {
  return {
    ...(isDefined(data.personID) && {
      personID: new ObjectId(data.personID.toString()),
    }),
    collection,
    topic: data.topic,
    from: data.from || null,
    to: data.to || null,
    createdAt: new Date(),
  }
}

export { mapAuditLog }
