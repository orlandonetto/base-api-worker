import { PubSub } from '@google-cloud/pubsub'

import { TypeCompany } from '../../src/api/companies/companies.types'
import config from '../../src/config'
import { TopicNames } from '../../src/types/global.enums' // Importa os tópicos definidos no enum
import { getCompaniesAndConnection } from '../utils'

const DEAD_LETTER_TOPIC = 'dlq' // Dead Letter Topic
const MAX_RETRIES = 5 // Número máximo de tentativas antes de enviar para o DLQ (min = 5)

const buildDefaultEndpoint = (topicName: string): string => {
  return `/${topicName.replace(/\./g, '/')}`
}

const buildPubSubUrl = (endpoint?: string) => {
  endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${config.server.baseURL}${endpoint}`
}

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

async function createSubscription(
  pubsub: PubSub,
  topicName: string,
  dlqTopicName: string,
  serviceAccount: string,
) {
  const endpoint = buildDefaultEndpoint(topicName)
  const url = buildPubSubUrl(endpoint)

  const subscriptionName = `${topicName}-sub`

  const [subscriptions] = await pubsub.getSubscriptions()
  const subscriptionExists = subscriptions.some(s =>
    s.name.includes(subscriptionName),
  )

  if (!subscriptionExists) {
    await pubsub.topic(topicName).createSubscription(subscriptionName, {
      pushConfig: {
        pushEndpoint: url, // URL para envio de mensagens
        oidcToken: {
          serviceAccountEmail: serviceAccount, // E-mail do service account que será autenticado no worker
          audience: config.server.baseURL, // URL base da API worker
        },
      },
      retryPolicy: {
        minimumBackoff: { seconds: 5 },
        maximumBackoff: { seconds: 30 },
      },
      deadLetterPolicy: {
        deadLetterTopic: `projects/${pubsub.projectId}/topics/${dlqTopicName}`, // Tópico DLQ
        maxDeliveryAttempts: MAX_RETRIES, // Número de tentativas antes de enviar para o DLQ
      },
      expirationPolicy: {
        ttl: null, // Define a expiração como "Nunca Expira"
      },
      enableMessageOrdering: true, // Garante que mensagens sejam processadas em ordem
    })

    // eslint-disable-next-line no-console
    console.log(`✅ Assinatura criada: ${subscriptionName}`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`⚡ Assinatura já existe: ${subscriptionName}`)
  }
}

async function setupPubSub(company: TypeCompany) {
  // eslint-disable-next-line no-console
  console.log(`🔄 Configurando Pub/Sub do tenant ${company.tenantID}`)

  const { file: credentials } = company.credentials.gcp

  const pubsub = new PubSub({
    credentials,
    projectId: credentials.project_id,
  })

  const serviceAccount = credentials.client_email

  // Cria o tópico DLQ
  await createTopic(pubsub, DEAD_LETTER_TOPIC)

  for (const topicKey of Object.keys(TopicNames)) {
    const topicName = TopicNames[topicKey as keyof typeof TopicNames]

    // Cria o tópico
    await createTopic(pubsub, topicName)
    await createSubscription(
      pubsub,
      topicName,
      DEAD_LETTER_TOPIC,
      serviceAccount,
    )
  }

  // eslint-disable-next-line no-console
  console.log('✅ Pub/Sub configurado com sucesso!')
}

const run = async () => {
  const { mongoConnection, companies = [] } = await getCompaniesAndConnection()

  // eslint-disable-next-line no-console
  console.log(`Configurando Pub/Sub para ${companies.length} tenants`)

  for await (const company of companies) {
    await setupPubSub(company).catch(console.error) // eslint-disable-line no-console
  }

  await mongoConnection.close()
  // eslint-disable-next-line no-console
  console.log('Conexao com o banco de dados fechada')

  // eslint-disable-next-line no-console
  console.log('Script executado com sucesso!')
  process.exit(0)
}

;(async () => {
  await run()
})()
