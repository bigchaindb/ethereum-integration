const express = require('express')
const debug = require('debug')
const logger = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')

// log
const log = debug('express')

// config
const config = require("dotenv").config();

// routes
const QueryRouter = require('./routes/QueryRouter')

// express
const app = express()
// middleware
app.use(function(req, res, next) {
  // headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
  next()
});
app.use(logger('dev'));
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
// define routes
app.use('/query', QueryRouter)
// listen
const server = app.listen(config.parsed.PORT_APP)

// export server
module.exports = server