import { PubSub } from '@google-cloud/pubsub'

import { TypeCompany } from '../../src/api/companies/companies.types'
import { TopicNames } from '../../src/types/global.enums' // Importa os tópicos definidos no enum
import { getCompaniesAndConnection } from '../utils'

const DEAD_LETTER_SUFFIX = '-dlq' // Sufixo para Dead Letter Topic
const MAX_RETRIES = 3 // Número máximo de tentativas antes de enviar para o DLQ

async function createTopic(pubsub: PubSub, topicName: string) {
  const [topics] = await pubsub.getTopics()
  const topicExists = topics.some(t => t.name.includes(topicName))

  if (!topicExists) {
    await pubsub.createTopic(topicName)
    // eslint-disable-next-line no-console
    console.log(`✅ Tópico criado: ${topicName}`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`⚡ Tópico já existe: ${topicName}`)
  }
}

async function createSubscription(pubsub: PubSub, topicName: string) {
  const subscriptionName = `${topicName}-sub`
  const dlqTopicName = `${topicName}${DEAD_LETTER_SUFFIX}`

  const [subscriptions] = await pubsub.getSubscriptions()
  const subscriptionExists = subscriptions.some(s =>
    s.name.includes(subscriptionName),
  )

  if (!subscriptionExists) {
    await pubsub.topic(topicName).createSubscription(subscriptionName, {
      deadLetterPolicy: {
        deadLetterTopic: `projects/${pubsub.projectId}/topics/${dlqTopicName}`,
        maxDeliveryAttempts: MAX_RETRIES,
      },
    })
    // eslint-disable-next-line no-console
    console.log(`✅ Assinatura criada: ${subscriptionName}`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`⚡ Assinatura já existe: ${subscriptionName}`)
  }
}

async function createDeadLetterTopic(pubsub: PubSub, topicName: string) {
  const dlqTopicName = `${topicName}${DEAD_LETTER_SUFFIX}`
  await createTopic(pubsub, dlqTopicName)
}

async function setupPubSub(company: TypeCompany) {
  // eslint-disable-next-line no-console
  console.log(`🔄 Configurando Pub/Sub do tenant ${company.tenantID}`)

  const pubsub = new PubSub({
    credentials: company.credentials.gcp.file,
  })

  for (const topicKey of Object.keys(TopicNames)) {
    const topicName = TopicNames[topicKey as keyof typeof TopicNames]

    await createTopic(pubsub, topicName)
    await createDeadLetterTopic(pubsub, topicName)
    await createSubscription(pubsub, topicName)
  }

  // eslint-disable-next-line no-console
  console.log('✅ Pub/Sub configurado com sucesso!')
}

const run = async () => {
  const { mongoConnection, companies = [] } = await getCompaniesAndConnection()

  for await (const company of companies) {
    await setupPubSub(company).catch(console.error) // eslint-disable-line no-console
  }

  await mongoConnection.close()
}

;(async () => {
  await run()
})()
