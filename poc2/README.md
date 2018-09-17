# Transaction listener and replicator for Ethereum and BigchainDB

## Structure

1. `config` contains the configurations files for the Ethereum and BigchainDB.
2. `contracts` contains the ethereum contracts and is used by truffle to search, compile, and migrate contracts.
3. `migrations` contains truffle migration scripts for the contracts.
4. `src` contains ethereum event listener and bigchaindb transaction executor.
5. `test` contains the script to create a transaction on ethereum using `truffle-contract`
6. `truffle-config.js` & `truffle.js` truffle config files for network setup

## Prerequisite

1. Node.js
2. BigchainDB
3. Truffle Framework (`npm install -g truffle` or on linux `sudo npm install -g truffle`)
4. Ganache or a running instance of ethereum.
5. Docker and Docker Compose (optional)

## How to deploy

1. Clone the repository and navigate to `poc2` folder.
2. Install the dependencies with `npm install`.
3. Update the `network.config.json` with the specific values of the bigchaindb and ethereum hosts.
4. Deploy the smart contracts by running `truffle migrate` in the root folder.
5. Copy the address of the `Token` printed after the `truffle migrate` into the `token.config.json`.
6. To run the listner execute `npm start`.
7. The listern is up & running and listening for `Transfer` events on your deployed contract.

## Build using docker

1. To build the docker image run: `docker-compose build`.
2. To start the container: `docker-compose up`.
3. Docker container is up and listening for `Transfer` events on your deployed contract.
