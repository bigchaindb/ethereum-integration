import Web3 from 'web3';
import {default as contract} from 'truffle-contract';
import tokenArtifact from '../build/contracts/Token.json';
import globals from '../config/globals.config.json';

const ETH_HOST = 'http://127.0.0.1:8545';
const tokenContract = contract(tokenArtifact);
const web3 = new Web3(new Web3.providers.HttpProvider(ETH_HOST));

tokenContract.setProvider(new Web3.providers.HttpProvider(ETH_HOST));
if (typeof tokenContract.currentProvider.sendAsync !== "function") {
    tokenContract.currentProvider.sendAsync = function() {
      return tokenContract.currentProvider.send.apply(
        tokenContract.currentProvider, arguments
      );
    };
  }

export function deployToken(fromAddr, args = {name: 'BDB Token', symbol: 'BDBT', supply: 100000000}) {
    tokenContract.defaults({from: fromAddr})
    return tokenContract.new(args.name, args.symbol, args.supply, {from: fromAddr, gas: 5000000})
}

export function unlockAccount(address, passphrase = globals.userPasssphrse, timeout = 1000) {
    return web3.eth.personal.unlockAccount(address, passphrase, timeout);
}

export function fundAccount(to, from, ethers) {
    web3.eth.sendTransaction({
        to,
        from,
        value: web3.utils.toWei(String(ethers), "ether")
    })
};

export function createAccount(passphrase = globals.userPasssphrse){
    const account = web3.eth.accounts.create(web3.utils.randomHex(32))
    return account.encrypt(passphrase);
}

export function decryptKeystore(keystoreJsonV3, password){
    return web3.eth.accounts.decrypt(keystoreJsonV3, password);
}

deployToken('0xfd3cf7b39e1301d5f0686e8760e68244a9cf18d1').then(
    instance => {
        instance.Transfer().watch((err, result)=>{
            if(!err){
                const {from , to, value } = result.args;
                console.log(from, to, value);
            }
        })
        instance.transfer('0xfd3cf7b39e1301d5f0686e8760e68244a9cf18d1', 10);
        return instance;
    }
).catch(err => console.log(err));