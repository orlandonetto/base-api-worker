import { ObjectId } from 'mongodb'

import { TypePerson, TypePersonRef } from './people.types'

const mapPersonRef = (person: TypePerson): TypePersonRef => {
  return {
    _id: new ObjectId(person._id.toString()),
    name: person.name,
    email: person.email,
    photo: person.photo,
  }
}

export { mapPersonRef }
