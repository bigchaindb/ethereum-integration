import Web3 from 'web3';
import {
    default as contract
} from 'truffle-contract';
import Tx from 'ethereumjs-tx';
import tokenArtifact from '../build/contracts/Token.json';
import globals from '../config/globals.config.json';

const ETH_HOST = 'http://127.0.0.1:8545';
const tokenContract = contract(tokenArtifact);
const web3 = new Web3(new Web3.providers.HttpProvider(ETH_HOST));

tokenContract.setProvider(new Web3.providers.HttpProvider(ETH_HOST));
if (typeof tokenContract.currentProvider.sendAsync !== "function") {
    tokenContract.currentProvider.sendAsync = function () {
        return tokenContract.currentProvider.send.apply(
            tokenContract.currentProvider, arguments
        );
    };
}

export function deployContract(fromAddress, privateKey, data) {
    let gasPrice = '0x20';
    const bufferPrivKey = Buffer.from(privateKey, 'hex');
    const gasLimit = web3.utils.toHex(5000000);
    return web3.eth.getTransactionCount(fromAddress).then(nonce => {
        nonce = web3.utils.toHex(nonce);
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
    });
}

export function fundAccount(to, from, ethers) {
    web3.eth.sendTransaction({
        to,
        from,
        value: web3.utils.toWei(String(ethers), "ether")
    })
};

export function createAccount(passphrase = globals.userPasssphrse) {
    const account = web3.eth.accounts.create(web3.utils.randomHex(32))
    return account.encrypt(passphrase);
}

export function decryptKeystore(keystoreJsonV3, password) {
    return web3.eth.accounts.decrypt(keystoreJsonV3, password);
}


deployContract('0xb516151b00cb282389bccf0996480e0e40c518f9',
    '245daaa3bd5acffb67e6c82ed151e9f31f580ee6c822b2f5910510223e286e5f', tokenArtifact.bytecode).then(value => {
    console.log(value.contractAddress)
    tokenContract.at(value.contractAddress).then(instance => {
        instance.Transfer().watch((err, result) => {
            if (!err) {
                const {
                    from,
                    to,
                    value
                } = result.args;
                console.log(from, to, value);
            }
        })
        return instance;
    });
})