const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
const path = require('path')
const cookieParser = require('cookie-parser');
const fs = require('fs')
const jwt = require("jsonwebtoken");

const homeController = require('./controllers/home')
const apiRouter = require('./routers/api')
const notfound = require('./middleware/notfound')
const errorMiddleware = require('./middleware/errors')


app.get('/favicon.ico', (req, res) => res.status(204))

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.get('/', homeController.index)


app.use('/api', apiRouter)

app.use(notfound)
app.use(errorMiddleware)


app.listen(port ?? 3000, () => {
  console.log(`Server running at http://localhost:${port}`)
})