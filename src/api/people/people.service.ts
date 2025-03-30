import { Db, ObjectId } from 'mongodb'

/* 
// import { updateManyOrdersPersonRef } from '../orders/orders.dao'
// @@ EXEMPLO @@
  const updateManyOrdersPersonRef = async (
    db: Db,
    personID: string | ObjectId,
    personRef: TypePersonRef,
  ) => {
    return db.collection<TypeOrder>(CollectionNames.Orders).updateMany(
      {
        'person._id': new ObjectId(personID.toString()),
        deleted: { $ne: true },
      },
      { $set: { person: personRef } },
    )
  }
*/
// import { updateManyPaymentsPersonRef } from '../payments/payments.dao'
// import { updateManyWithdrawsPersonRef } from '../withdraws/withdraws.dao'
// import { mapPersonRef } from './people.helper'
import { TypePerson } from './people.types'

const updatePersonInAllDependencies = async (
  db: Db,
  personID: string | ObjectId,
  person: TypePerson,
) => {
  // const personRef = mapPersonRef(person)

  await Promise.all([
    // updateManyOrdersPersonRef(db, personID, personRef),
    // updateManyPaymentsPersonRef(db, personID, personRef),
    // updateManyWithdrawsPersonRef(db, personID, personRef),
  ])
}

export { updatePersonInAllDependencies }
