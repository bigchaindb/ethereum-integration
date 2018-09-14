# BDB query engine #

### Setup requirements ###
- Install nodejs
- Install npm packages with `npm install`
- Create `.env` file from `.env-example` with configuration
- Start api with `npm run start`

### Query API ###

Query api accepts POST request to a `/query` endpoint with JSON object.
JSON object can have properties listed below.

Get transactions by id or multiple ids:
- `id: "transaction_id"`
- `id: ["transaction_id1","transaction_id2",...]`

Get transactions by assetid or multiple asset ids:
- `assetid: "transaction_assetId"`
- `assetid: ["transaction_assetId1","transaction_assetId2",...]`

Get transactions with output owned by publicKey
- `publickey: "publicKey"`

Filter transactions by spent or unspent status
- `spent: true`
- `spent: false`

Filter transactions by asset data with mongodb operators
- `asset: { "asset.keyname": "value" }`
- `asset: { "asset.keyname": { $gt: 4, $lt: 6 } }`

Filter transactions by metadata with mongodb operators
- `metadata: { "metadata.keyname": "value" }`

Count transactions after all the filtering
- `count: true`

Get sum of variables after all filtering
- `sum: "asset.keyname"`
- `sum: "metadata.keyname"`

Example of getting all transactions with assetid that are owned by publickey are not spent and have in metadata "keyname" with value "value".
`{
  assetid: "ea115210c9b41fb2f47aa587dfe0763fac2da225c43319afc28a64d740e289d1",
  publickey: "5cbZpSZiojZKbmoiyxZtp3mnMbyt3vgxz4k8QnzcH3qX",
  spent: false,
  metadata: { "metadata.keyname": "value" }`
}`

Example of getting count of transactions that are owned by publickey have type:"scan" and timestamp greater then 1451602800000 and lower then 1514674800000.
`{
	"publickey": "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert",
	"asset": {
		"asset.type": "scan",
		"asset.timestamp": {"$gte":1451602800000, "$lte":1514674800000}
	},
	"count": true
}`

