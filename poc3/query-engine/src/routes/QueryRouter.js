const express = require('express')
const router = express.Router()

const mongo = require('../shared/mongo')

// config
const config = require("dotenv").config();

/*
  Query route
*/
router.post('/', async function(req, res, next) {
  try {
    const data = await mongo.getQuery(req.body);
    return res.send({"status": "success", "data": data})
  } catch (error) {
    console.error(error)
    return res.status(500).send()
  }
})

module.exports = router