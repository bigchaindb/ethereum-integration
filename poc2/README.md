## Listener for events on a specific smart contract

1. Update the `network.config.json` with the specific values of the bigchaindb and ethereum hosts
2. Deploy the smart contracts. Just do a `truffle migrate` in the root folder.
3. Copy the address of the `Token` printed after the `truffle migrate` into the `token.config.json`
4. Get the ABI of the Token contract and put it in the `token.config.json`. It can be found in the `contracts\Token.json` file.
5. Execute `docker-compose up`.
6. Docker is up and listening for `Transfer` events on your deployed contract.
