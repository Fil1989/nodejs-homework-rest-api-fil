const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const { WrongPathError } = require('./errorHelpers/errors')
const { errorHandler } = require('./errorHelpers/apiHelpers')

const contactsRouter = require('./router/api/contactsRouter')
const authRouter = require('./router/api/authRouter')
const filesRouter = require('./router/api/filesRouter')

const app = express()
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api/contacts', contactsRouter)
app.use('/api/users', authRouter)
app.use('/avatars', filesRouter)

app.use(() => {
  throw new WrongPathError('This is wrong endpoint')
})
app.use(errorHandler)

module.exports = app
