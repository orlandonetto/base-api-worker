import { MongoClient } from 'mongodb'

const connect = async ({
  host,
  options,
}: {
  host: string
  options: object
}): Promise<MongoClient> => {
  try {
    const client = await MongoClient.connect(host, options)
    console.log(`Successfully connected to the database.`)

    return client
  } catch (error) {
    /* eslint no-console: "off" */
    console.error(`Failed to connect to the database. ${error.stack}`)
    throw error
  }
}

export { connect }
