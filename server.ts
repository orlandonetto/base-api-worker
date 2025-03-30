import app from './src/app'
import config from './src/config'
import { connect } from './src/services/mongo'

/* O set immediate serve para garantir que só irá executar após tudo concluir a execução */
setImmediate(async () => {
  const { mongo } = config
  const { host, options } = mongo

  const client = await connect({ host, options })
  app.locals.mongo = client

  // Initialize mailer transporter
  // import('./src/services/email')

  const { port } = config
  const message = `API initialized on port ${port}`

  app.listen(port, () => console.log(message)) // eslint-disable-line no-console
})
