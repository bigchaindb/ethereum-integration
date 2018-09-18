# BigchainDB - Ethereum Integration

The code in this repository implements [BEP-15 (Ethereum Integration Tools & Demo 1)](https://github.com/bigchaindb/BEPs/tree/master/15). For more details on what is being done here, please read the mentioned BEP first.

This repository contains three proofs of concepts:

## PoC 1 (/poc1) (public Ethereum with oraclize)

POC1 tries to showcase an approach, using which we can leverage the decentralized data storage capability of BigchainDB and decentralized logic execution (smart contracts) of ethereum.

### PoC1 flow

POC1 queries and fetches the data stored in BigchainDB when a smart contract function is invoked (or a condition is met) using the oraclize service.

On successfully retrieval of data using oraclize, the smart contract evaluates and executes the logic and performs the requested operation.

### The /poc1 directory contains

- Data generation functions for BigchainDB in /bdb
- Payment initiation in Ethereum smart contract using `infura` network in /oracle/src/index.js
- Ethereum contracts are in /oracle/contracts

## PoC 2 (/poc2)

This proof of concept creates ERC20 token on Ethereum network and listens for token transfers. All token transfers are replicated on BigchainDB as divisible asset transfers.

### PoC2 flow (private Ethereum with custom service)

- Ethereum and BigchainDB get ERC20 token and Divisible asset minted
- Service listens to Ethereum network for our ERC20 token transfers
- On ERC20 token transfer the divisible asset on BigchainDB is transferred accordingly.

### The /poc2 directory contains

- ERC20 token contract in /contracts
- Listener in nodejs that transfers divisible assets in /src/eth.js

## PoC 3 (/poc3) (private Ethereum with Stargate)

Third proof of concept is similar to POC 1 but it uses a slightly complex query and smart contract. It also uses a private Ethereum network and the integration between Ethereum and BigchainDB is done using the `Stargate` tool from Oraclize.

### PoC3 flow

- Create scans as assets on BigchainDB with timestamp
- Execute smart contract that uses query-engine to retrieve number of transaction for a particular output (public key).
- If number of transactions is greater then predefined amount then ether is transferred to the recipient.

### The /poc3 directory contains

- Query-engine service which can be used to query MongoDB of BigchainDB in /query-engine
- Ethereum contract on /eth

## More Details

More details about each of these proofs of concepts can be found in the respective README.md files in the corresponding directories.