# Quickstart POC1

## About

POC1 tries to showcase an appoch, using which we can leverage the decentralized data storage capability of BigchainDB and logic execution of ethereum to create a powerful Dapp.

POC1 queries and fetches the data stored in BigchainDB when a smart contract function is invoked( or a condition is met) using the oraclize service.
On successfully, receiving the data the smart contract evaluates and executes the method logic and performs the requested operation.

## Install requirements

- Install nodejs
- Install npm packages with `npm install`
- Install contracts with `truffle install`

## Prepare configuration

- Get api key from [Infura.io](https://infura.io/)
- Generate keys and addresess with `npm run generate`
- Create .env file from .env-example

## Deploy contracts to rinkeby

- Compile contracts with `truffle compile`
- Deploy contracts to rinkeby network `truffle migrate --network rinkeby`
- Update .env with new BDBADAPTERADDRESS

## Execute transfer

- Run transfer with `npm run start`

## Test

The test deploys the contract on the Rinkeby network, executes the oraclize query and listens to the events to track the progress of the query.

### To execute the test:

- Modify the `test/TestParam.json` as per the requirement.
- Make sure the `from_address` mentioned in the `test/TestParam.json` is unlocked during the test execution and has sufficient funds. Since this account is going to be used for contract deployment and transaction execution.
- From command line/terminal run: `truffle test`.

###
The latitude and longitude are stored multiplied by 1000000 (a million)