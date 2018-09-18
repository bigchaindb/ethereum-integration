# POC 1

## About

POC1 tries to showcase an approach, using which we can leverage the decentralized data storage capability of BigchainDB and decentralized logic execution (smart contracts) of ethereum.

POC1 queries and fetches the data stored in BigchainDB when a smart contract function is invoked (or a condition is met) using the oraclize service.

On successfully retrieval of data using oraclize, the smart contract evaluates and executes the logic and performs the requested operation.

## Setup

- Install nodejs
- Install npm packages with `npm install`
- Install contracts with `truffle install`

## Configure

- Get api key from [Infura.io](https://infura.io/)
- Generate keys and addresess with `npm run generate`
- Create .env file from .env-example

## Deploy smart contract

- Compile contracts with `truffle compile`
- Deploy contracts to rinkeby test network `truffle migrate --network rinkeby`
- Update .env with new `BDBADAPTERADDRESS`

## Execute transfer

- Run transfer with `npm run start`

## Test

The test deploys the contract on the Rinkeby network, executes the oraclize query and listens to the events to track the progress of the query.

### To execute the test:

- Modify the `test/TestParam.json` as per the requirement.
- Make sure the `from_address` mentioned in the `test/TestParam.json` is unlocked during the test execution and has sufficient funds. Since this account is going to be used for contract deployment and transaction execution.
- From command line/terminal run: `truffle test`.