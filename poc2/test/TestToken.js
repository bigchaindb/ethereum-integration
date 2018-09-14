import Web3 from 'web3';
import network from '../config/network.config.json';
import {default as contract } from 'truffle-contract';
import tokenArtifact from '../build/contracts/Token.json'

const web3 = new Web3(new Web3.providers.WebsocketProvider(network.ethereum.host));
//const contract = new web3.eth.Contract(tokenConfig.abi, tokenConfig.address);

const tokenContract = contract(tokenArtifact);
tokenContract.setProvider(new Web3.providers.HttpProvider(network.ethereum.host));
tokenContract.defaults({from: '0x3cf3a1d91c8628d33aaf5184ced04c55c437a0df'})
if (typeof tokenContract.currentProvider.sendAsync !== "function") {
    tokenContract.currentProvider.sendAsync = function() {
      return tokenContract.currentProvider.send.apply(
        tokenContract.currentProvider, arguments
      );
    };
  }

tokenContract.deployed().then(contract => {
contract.transfer('0x7b39b8bedd76753e8b7657bce9d6fc42fdc30d78', 10)
})