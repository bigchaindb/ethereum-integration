const express = require('express')
const router = express.Router()

const mongo = require('../shared/mongo')

// config
const config = require("dotenv").config();

/*
  Query route
*/
router.post('/', async function(req, res, next) {

  const data = await mongo.getQuery(req.body);

  // kra
  return res.send({"status": "success", "data": data})

})

module.exports = router