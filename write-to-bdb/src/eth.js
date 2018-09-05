import Web3 from 'web3';
import {default as contract} from 'truffle-contract';
import Tx from 'ethereumjs-tx';
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

export function deployContract(fromAddress, privateKey, data){
    let gasPrice = '0x20';
    const bufferPrivKey = Buffer.from(privateKey,'hex');
    const gasLimit = web3.utils.toHex(5000000);
    /**
     * Todo: find way to get correct nonce
     */
    let nonce = web3.eth.getTransactionCount(fromAddress, 'pending');
    nonce = web3.utils.toHex(4);
    const rawTx = {
        nonce,
        gasPrice,
        gasLimit,
        value: '0x00',
        from: fromAddress,
        data
    };
    const tx = new Tx(rawTx);
    tx.sign(bufferPrivKey);
    const serializedTx = tx.serialize().toString('hex');
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
}

deployContract('0xb516151b00cb282389bccf0996480e0e40c518f9',
'245daaa3bd5acffb67e6c82ed151e9f31f580ee6c822b2f5910510223e286e5f', tokenArtifact.bytecode).then(value => {
    console.log(value);
})

export function deployToken(fromAddr, args = {name: 'BDB Token', symbol: 'BDBT', supply: 100000000}) {
    tokenContract.defaults({from: fromAddr})
    return tokenContract.new(args.name, args.symbol, args.supply, {from: fromAddr, gas: 5000000})
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

/* deployToken('0xc15c5819f21ced45b63838fd875b3091631f869b').then(
    instance => {
        instance.Transfer().watch((err, result)=>{
            if(!err){
                const {from , to, value } = result.args;
                console.log(from, to, value);
            }
        })
        instance.transfer('0x65f2b50437d1584fc2a5eaa8b565f8c983e2bf42', 10);
        return instance;
    }
).catch(err => console.log(err)); */