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

Paginated results
- `page: 0`
- `perPage: 100`

*Note: Default limit per results is 1000*

### Examples ###

#### 1. Get transaction with id.####

Send POST request to /query endpoint with JSON body:

```json
{
  id: "ea115210c9b41fb2f47aa587dfe0763fac2da225c43319afc28a64d740e289d1"
}
```

Response:
```json
{
    "status": "success",
    "data": [
        {
            "_id": "5b9a6ca45d15b40008724ab5",
            "id": "ea115210c9b41fb2f47aa587dfe0763fac2da225c43319afc28a64d740e289d1",
            "operation": "CREATE",
            "outputs": [
                {
                    "condition": {
                        "details": {
                            "type": "ed25519-sha-256",
                            "public_key": "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert"
                        },
                        "uri": "ni:///sha-256;nlTm4pyKkNoDaqYvOH_OroiZBnnTUshR3KZDNiG3rQ4?fpt=ed25519-sha-256&cost=131072"
                    },
                    "amount": "1",
                    "public_keys": [
                        "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert"
                    ]
                }
            ],
            "inputs": [
                {
                    "fulfillment": "pGSAILeDCuT7jqYFcCJn3Jj1RUDjhVZ1Cz5-KRBxYmpc87UugUAyplQj46O_xCDNJzhTj8Wndn48fuVtCW7DqJALwuky7ZGNSrQ8J1WBe2yd30g2C30zvn6YkINr8iyW1UxDZRcC",
                    "fulfills": null,
                    "owners_before": [
                        "DMMWCQjoG8PHd8JvkrPraRZs7b26FG25gcnNnt7sVybT"
                    ]
                }
            ],
            "version": "2.0"
        }
    ]
}
```

#### 2. Get transaction with id and have metadata object "keyname" with value "value".####

Send POST request to /query endpoint with JSON body:

```json
{
  id: "ea115210c9b41fb2f47aa587dfe0763fac2da225c43319afc28a64d740e289d1",
  metadata: { "metadata.keyname": "value" }
}
```

Response:
```json
{
    "status": "success",
    "data": [
        {
            "_id": "5b9a6ca45d15b40008724ab5",
            "id": "ea115210c9b41fb2f47aa587dfe0763fac2da225c43319afc28a64d740e289d1",
            "operation": "CREATE",
            "outputs": [
                {
                    "condition": {
                        "details": {
                            "type": "ed25519-sha-256",
                            "public_key": "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert"
                        },
                        "uri": "ni:///sha-256;nlTm4pyKkNoDaqYvOH_OroiZBnnTUshR3KZDNiG3rQ4?fpt=ed25519-sha-256&cost=131072"
                    },
                    "amount": "1",
                    "public_keys": [
                        "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert"
                    ]
                }
            ],
            "inputs": [
                {
                    "fulfillment": "pGSAILeDCuT7jqYFcCJn3Jj1RUDjhVZ1Cz5-KRBxYmpc87UugUAyplQj46O_xCDNJzhTj8Wndn48fuVtCW7DqJALwuky7ZGNSrQ8J1WBe2yd30g2C30zvn6YkINr8iyW1UxDZRcC",
                    "fulfills": null,
                    "owners_before": [
                        "DMMWCQjoG8PHd8JvkrPraRZs7b26FG25gcnNnt7sVybT"
                    ]
                }
            ],
            "version": "2.0",
            "metadata": {
                "keyname": "value"
            }
        }
    ]
}
```

#### 3. Get transaction with id and asset with object "assetkey" with value "assetvalue" ####

Send POST request to /query endpoint with JSON body:

```json
{
  id: "ea115210c9b41fb2f47aa587dfe0763fac2da225c43319afc28a64d740e289d1",
  asset: { "asset.assetkey": "assetvalue" }
}
```

Response:
```json
{
    "status": "success",
    "data": [
        {
            "_id": "5b9a6ca45d15b40008724ab5",
            "id": "ea115210c9b41fb2f47aa587dfe0763fac2da225c43319afc28a64d740e289d1",
            "operation": "CREATE",
            "outputs": [
                {
                    "condition": {
                        "details": {
                            "type": "ed25519-sha-256",
                            "public_key": "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert"
                        },
                        "uri": "ni:///sha-256;nlTm4pyKkNoDaqYvOH_OroiZBnnTUshR3KZDNiG3rQ4?fpt=ed25519-sha-256&cost=131072"
                    },
                    "amount": "1",
                    "public_keys": [
                        "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert"
                    ]
                }
            ],
            "inputs": [
                {
                    "fulfillment": "pGSAILeDCuT7jqYFcCJn3Jj1RUDjhVZ1Cz5-KRBxYmpc87UugUAyplQj46O_xCDNJzhTj8Wndn48fuVtCW7DqJALwuky7ZGNSrQ8J1WBe2yd30g2C30zvn6YkINr8iyW1UxDZRcC",
                    "fulfills": null,
                    "owners_before": [
                        "DMMWCQjoG8PHd8JvkrPraRZs7b26FG25gcnNnt7sVybT"
                    ]
                }
            ],
            "version": "2.0",
            "asset": {
                "assetkey": "assetvalue"
            }
        }
    ]
}
```

#### 4. Getting count of transactions that are owned by publickey and have asset timestamp between values.

Send POST request to /query endpoint with JSON body:

```json
{
	"publickey": "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert",
	"asset": {
		"asset.timestamp": {"$gte":1451602800000, "$lte":1514674800000}
	},
	"count": true
}
```

Response:
```json
{
    "status": "success",
    "data": [
        {
            "count": 904
        }
    ]
}
```

#### 5. Getting sum of values in transactions that are owned by publickey and have asset timestamp between values.

Send POST request to /query endpoint with JSON body:

```json
{
	"publickey": "HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert",
	"asset": {
		"asset.timestamp": {"$gte":1451602800000, "$lte":1514674800000}
	},
	"sum": "asset.amount"
}
```

Response:
```json
{
    "status": "success",
    "data": [
        {
            "sum": 125599
        }
    ]
}
```
