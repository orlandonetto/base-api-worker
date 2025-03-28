import cors from 'cors'
import express, { Request, Response, NextFunction } from 'express'
import morgan from 'morgan'

import 'express-async-errors'

import routes from './api'
import { extractAuthorizationData } from './middlewares/auth-middleware'
import {
  notFoundHandler,
  exceptionHandler,
} from './middlewares/errors-handlers'

const app = express()

app.use(
  cors({
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    exposedHeaders: ['x-count'],
  }),
)

app.use(morgan('dev'))
app.use(express.json())

// Initiate Request Locals Object
app.use((request: Request, _: Response, next: NextFunction) => {
  Object.assign(request, { locals: {} })

  next()
})

// Authorization Data
app.use(extractAuthorizationData)

// Routes
app.use(routes)

// Default 404 replace to 403
app.use(notFoundHandler)

// Exception Handler
app.use(exceptionHandler)

export default app
