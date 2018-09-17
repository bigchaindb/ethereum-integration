# BigchainDB - Ethereum Integration

The code in this repository implements [BEP-15 (Ethereum Integration Tools & Demo 1)](https://github.com/bigchaindb/BEPs/tree/master/15). For more details on what is being done here, please read the mentioned BEP first.

This repository contains three proof of concepts:

## PoC 1 (/poc1)

First proof of concept is about truck creating location updates on BigchainDB and can initiate payment on ethereum if his location is the same as delivery location.

### PoC1 flow

- Truck heads towards location and is constantly creating assets to BigchainDB with current location.
- Truck arrives to destination and location is stored on BigchainDB.
- Receiver initiates payment over Ethereum contract which checks with help of Oraclize if location on BigchainDB is same as delivery location.
- Ether is transferred to address if location is the same.

### The /poc1 directory contains

- Truck data generation script in /truck
- Payment initiation in nodejs over `infura` network in /oracle/src/index.js
- Ethereum contracts are in /oracle/contracts

## PoC 2 (/poc2)

This proof of concept creates ERC20 token on Ethereum network and listens for token transfers. All token transfers are replicated on BigchainDB as divisible asset transfers.

### PoC2 flow

- Ethereum and BigchainDB get ERC20 token and Divisible asset minted
- Service listens to Ethereum network for our ERC20 token transfers
- On ERC20 token transfer the divisible asset on BigchainDB is transferred accordingly.

### The /poc2 directory contains

- ERC20 token contract in /contracts
- Listener in nodejs that transfers divisible assets in /src/eth.js

## PoC 3 (/poc3)

Third proof of concept is about logging scans as create transaction on BigchainDB and retrieving number of transactions created between two dates that we set as parameters.

### PoC3 flow

- Create scans as assets on BigchainDB with timestamp
- Execute smart contract that uses query-engine to retrieve number of transaction between two dates.
- If number of transactions is greater then predefined amount the ether is transferred.

### The /poc3 directory contains

- Query-engine service which can be used to query MongoDB of BigchainDB in /query-engine
- Ethereum contract on /eth
