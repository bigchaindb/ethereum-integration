# Quickstart for POC3

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

## To execute the test

- Modify the `test/TestParam.json` as per the requirement.
- Make sure the `from_address` mentioned in the `test/TestParam.json` is unlocked during the test execution and has sufficient funds. Since this account is going to be used for contract deployment and transaction execution.
- From command line/terminal run: `truffle test`.

## Additional Information - Running in private ethereum network

We requested the [oraclize.it](https://www.oraclize.it) team and secured the credentials to beta test their upcoming product [Stargate](https://docs.oraclize.it/#development-tools-ethpm).
Using stargate we were successful in running the POC end-to-end on our private ethereum network setup.
Please connect with the oraclize team to get further information about Stargate and how to use it.