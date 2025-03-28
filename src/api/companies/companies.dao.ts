import { Db } from 'mongodb'

import { CollectionNames } from '../../types/global.enums'
import { TypeCompany } from './companies.types'

const findCompanyByTenantID = async (
  db: Db,
  tenantID: string,
): Promise<TypeCompany> => {
  return db
    .collection<TypeCompany>(CollectionNames.Companies)
    .findOne({ tenantID, deleted: { $ne: true } })
}

export { findCompanyByTenantID }
