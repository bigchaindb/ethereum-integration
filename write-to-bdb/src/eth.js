import Web3 from 'web3';
import {
    default as contract
} from 'truffle-contract';
import Tx from 'ethereumjs-tx';
import tokenArtifact from '../build/contracts/Token.json';
import globals from '../config/globals.config.json';
import bdbConfig from '../config/bigchaindb.config.json';
import bdb from './bdb'
import jetpack from 'fs-jetpack'

const ETH_HOST = 'http://127.0.0.1:8545';
const tokenContract = contract(tokenArtifact);
const web3 = new Web3(new Web3.providers.WebsocketProvider(ETH_HOST));

const initialSupply = 100000000
const transferAmount = 10
const ethAccount = {
    address: '0x2dd9253b379bed268947d71483c63114859d9e46',
    privateKey: '4953b960d5ed29fbdd8cdaa03c4228be995316cae0e0fb988f742455a68d1254'
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

/* web3.eth.subscribe('logs', {
}, function(error, result){
        console.log(error, result);
}); */

deployContract(ethAccount.address, ethAccount.privateKey, tokenArtifact.abi, tokenArtifact.bytecode, ['BDB Token', 'BDBT', 1000000000]).then(async value => {
    const asset = {
        name: 'ethereum ERC20 token',
        timestamp: Date.now()
    }
    // Mint token in BigchainDB
    const bdbToken = await bdb.createNewDivisibleAsset(asset, initialSupply)
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
    const env = jetpack.cwd(__dirname).read('../config/bigchaindb.config.json', 'json');
    env[id] = value
    jetpack.cwd(__dirname).write('../config/bigchaindb.config.json', env);
}