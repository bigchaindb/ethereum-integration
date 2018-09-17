const MongoClient = require('mongodb').MongoClient;

const config = require("dotenv").config();

let conn = null;

module.exports = {

  getQuery: async function(inputs) {
      // Get the connection to MongoDB
      await this.connect()
      const db = conn.db("bigchain")

      let pipeline = []

      // PRIMARY: match by txId / assetId / fullfillable public key
      let primaryMatch = {}
      let ids = []
      if (inputs.id !== undefined) {
        if (Array.isArray(inputs.id)) {
          ids = inputs.id
        } else {
          ids.push(inputs.id)
        }
        primaryMatch.id = {
          $in: ids
        }
      }
      let assetids = []
      if (inputs.assetid !== undefined) {
        if (Array.isArray(inputs.assetid)) {
          assetids = inputs.assetid
        } else {
          assetids.push(inputs.assetid)
        }
        primaryMatch["asset.id"] = {
          $in: assetids
        }
      }
      if (inputs.publickey !== undefined) {
        primaryMatch.outputs = {
          $elemMatch: {
            public_keys: inputs.publickey
          }
        }
      }
      if (Object.keys(primaryMatch).length > 0) {
        pipeline.push({
          $match: primaryMatch
        })
      }
      // SECONDARY: asset / metadata / spent-unspent
      if (inputs.asset !== undefined || (inputs.sum !== undefined && inputs.sum.startsWith("asset"))) {
        pipeline.push({
          $lookup: {
            from: "assets",
            let: {
              id: "$id"
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $eq: ["$id", "$$id"]
                  }
                }
              },
              {
                $replaceRoot: {
                  newRoot: "$data"
                }
              }
            ],
            as: "asset"
          }
        })
        pipeline.push({
          $unwind: {
            path: "$asset"
          }
        })
        if (inputs.asset !== undefined) {
          pipeline.push({
            $match: inputs.asset
          })
        }
      }
      if (inputs.metadata !== undefined || (inputs.sum !== undefined && inputs.sum.startsWith("metadata"))) {
        pipeline.push({
          $lookup: {
            from: "metadata",
            let: {
              id: "$id"
            },
            pipeline: [{
                $match: {
                  $expr: {
                    $eq: ["$id", "$$id"]
                  }
                }
              },
              {
                $replaceRoot: {
                  newRoot: "$metadata"
                }
              }
            ],
            as: "metadata"
          }
        })
        pipeline.push({
          $unwind: {
            path: "$metadata"
          }
        })
        if (inputs.metadata !== undefined) {
          pipeline.push({
            $match: inputs.metadata
          })
        }
      }
      if (inputs.spent !== undefined) {
        pipeline.push({
          $unwind: {
            path: "$outputs",
            includeArrayIndex: "outputs.outputIndex"
          }
        })
        pipeline.push({
          $lookup: {
            from: "transactions",
            let: {
              id: "$id",
              outputIndex: "$outputs.outputIndex"
            },
            pipeline: [{
                $unwind: {
                  path: "$inputs"
                }
              },
              {
                $match: {
                  $expr: {
                    $and: [{
                        $eq: ["$inputs.fulfills.transaction_id", "$$id"]
                      },
                      {
                        $eq: ["$inputs.fulfills.output_index", "$$outputIndex"]
                      }
                    ]
                  }
                }
              },
            ],
            as: "spents"
          }
        })
        if (inputs.spent === true) {
          pipeline.push({
            $match: {
              spents: {
                $not: {
                  $size: 0
                }
              }
            }
          })
        }
        if (inputs.spent === false) {
          pipeline.push({
            $match: {
              spents: {
                $size: 0
              }
            }
          })
        }
      }
      if (inputs.count !== undefined) {
        pipeline.push({
          $count: "count"
        })
      }
      if (inputs.sum !== undefined) {
        pipeline.push({
          $group: {
            _id : null,
            sum: {
              $sum: "$"+inputs.sum
            }
          }
        })
      }
      // default paging
      let perPage = 1000;
      if (inputs.perPage !== undefined) {
        perPage = inputs.perPage;
      }
      let page = 0
      if (inputs.page !== undefined) {
        page = inputs.page;
      }
      if (page > 0) {
        pipeline.push({
          $skip: inputs.page * perPage
        })
      }
      pipeline.push({
        $limit: perPage
      })

      const transactions = await db.collection("transactions").aggregate(pipeline).toArray()

      this.closeConnection()
      return transactions
    },

    connect: function(url = `mongodb://${config.parsed.HOST_MONGO}:${config.parsed.PORT_MONGO}/bigchain`) {
      return new Promise((resolve, reject) => {
        MongoClient.connect(url, {
          useNewUrlParser: true
        }, function(err, resp) {
          if (!err) {
            conn = resp
            resolve(true)
          } else {
            reject(err)
          }
        })
      })
    },

    closeConnection: function() {
      conn.close()
    }

}