const HDWalletProvider = require("truffle-hdwallet-provider");
const config = require("dotenv").config();

const mnemonic = config.parsed.MNEMONIC;
const infuraKey = config.parsed.INFURAKEY;
const url = `https://rinkeby.infura.io/v3/${infuraKey}`;
const fromAddress = config.parsed.FROMADDRESS;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, url),
      network_id: '4', // rinkeby
      from: fromAddress
    }
  }
};