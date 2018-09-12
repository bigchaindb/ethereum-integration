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
      if (inputs.fullfill !== undefined) {
        primaryMatch.outputs = {
          $elemMatch: {
            public_keys: inputs.fullfill
          }
        }
      }
      if (Object.keys(primaryMatch).length > 0) {
        pipeline.push({
          $match: primaryMatch
        })
      }
      // SECONDARY: asset / metadata / spent-unspent
      if (inputs.asset !== undefined) {
        pipeline.push({
          $lookup: {
            from: "assets",
            let: {
              id: "$id"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                      $eq: ["$id", "$$id"]
                  }
                }
              },
              { $replaceRoot: { newRoot: "$data" } }
            ],
            as: "asset"
          }
        })
        pipeline.push({
          $match: {
            asset: {
              $elemMatch: inputs.asset
            }
          }
        })
      }
      if (inputs.metadata !== undefined) {
        pipeline.push({
          $lookup: {
            from: "metadata",
            let: {
              id: "$id"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                      $eq: ["$id", "$$id"]
                  }
                }
              },
              { $replaceRoot: { newRoot: "$metadata" } }
            ],
            as: "metadata"
          }
        })
        pipeline.push({
          $match: {
            metadata: {
              $elemMatch: inputs.metadata
            }
          }
        })
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