import nodemailer from 'nodemailer'

import config from '../../config'

const {
  email: { host, port },
} = config

const sendEmail = async (to, subject, html, credentials) => {
  // eslint-disable-next-line no-console
  console.log(
    `mailer transporter is initiated with user [${credentials.email}]`,
  )

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user: credentials.email, pass: credentials.pass },
  })

  const info = await transporter.sendMail({
    from: credentials.email,
    to,
    subject,
    html,
  })

  // eslint-disable-next-line no-console
  console.log(`Message sent: ${info.messageId}`)
}

export { sendEmail }
