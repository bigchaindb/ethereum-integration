import Web3 from 'web3';
import {
    default as contract
} from 'truffle-contract';
import Tx from 'ethereumjs-tx';
import tokenArtifact from '../build/contracts/Token.json';
import tokenConfig from '../config/token.config.json';
import globals from '../config/globals.config.json';
import bdb from './bdb'
import jetpack from 'fs-jetpack'

const ETH_HOST = 'http://127.0.0.1:8545';
const tokenContract = contract(tokenArtifact);
const web3 = new Web3(new Web3.providers.WebsocketProvider(ETH_HOST));

const ethAccount = {
    address: '0x967662ac01db48bec7f5f90c0be9ae64e2295e4a',
    privateKey: '975bde796ec0e69367859da5c0fd96c408ea116aa42f86feec285d563c90efd5'
}

tokenContract.setProvider(new Web3.providers.WebsocketProvider(ETH_HOST));
if (typeof tokenContract.currentProvider.sendAsync !== "function") {
    tokenContract.currentProvider.sendAsync = function () {
        return tokenContract.currentProvider.send.apply(
            tokenContract.currentProvider, arguments
        );
    };
}

export function deployContract(fromAddress, privateKey, abi, data, args) {
    let gasPrice = '0x20';
    const bufferPrivKey = Buffer.from(privateKey, 'hex');
    const gasLimit = web3.utils.toHex(5000000);
    let contract = new web3.eth.Contract(abi);
    data = contract.deploy({
        data,
        arguments: args
    }).encodeABI();
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

deployContract(ethAccount.address, ethAccount.privateKey, tokenArtifact.abi, tokenArtifact.bytecode, 
                [tokenConfig.name, tokenConfig.symbol, tokenConfig.supply]).then(async value => {
    const asset = {
        name: tokenConfig.name,
        symbol: tokenConfig.symbol,
        ethAddress: value.contractAddress,
        timestamp: Date.now()
    }
    // Mint token in BigchainDB
    const bdbToken = await bdb.createNewDivisibleAsset(asset, tokenConfig.supply)
    updateConfig('tokenId', bdbToken.id);
    let tokenCon = new web3.eth.Contract(tokenArtifact.abi, value.contractAddress);
    tokenCon.events.Transfer({}, async function (err, event) {
        if (!err) {
            const newBdbUser = bdb.createKeypair('random number will be')
            const transferBdb = await bdb.transferTokens(undefined, bdbToken.id, event.returnValues.value, newBdbUser.publicKey)
        } else {
            console.log(err);
        }
    })

    tokenContract.at(value.contractAddress).then(instance => {
        instance.transfer('0x773e93488e6e9e00c9440ae8e6f84949b52b1c18', 10, {
            from: ethAccount.address
        });
        return instance;
    })
})

// Update with the asset id of the token
async function updateConfig(id, value) {
    const env = jetpack.cwd(__dirname).read('../config/token.config.json', 'json');
    env[id] = value
    jetpack.cwd(__dirname).write('../config/token.config.json', env);
}