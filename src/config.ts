import dotenv from 'dotenv'

dotenv.config()

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '5000',
  server: {
    baseURL: process.env.SERVER_BASE_URL || 'http://localhost:5000',
  },
  mongo: {
    host: process.env.MONGO_HOST || 'mongodb://localhost:27017',
    tenantsDBName: process.env.MONGO_TENANTS_DB_NAME || 'base-tenants-dev',
    mockTenantsDBName:
      process.env.MONGO_TENANTS_DB_NAME_MOCK || 'base-tenants-test',
    mockDBName: process.env.MONGO_DB_NAME_MOCK || 'base-test',
    options: {
      serverSelectionTimeoutMS: 10000,
    },
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    user: process.env.SMTP_USER || 'no-reply@base.com',
    pass: process.env.SMTP_PASS || 'shh',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'shh',
    expiration: process.env.JWT_EXP || '8h',
    expirationRefresh: process.env.JWT_EXP_REFRESH || '1M', // (M = month)
  },
}
