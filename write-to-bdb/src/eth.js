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
const web3 = new Web3(new Web3.providers.HttpProvider(ETH_HOST));

const initialSupply = 100000000
const transferAmount = 10
const ethAccount = {
    address: '0x493d8f220d9cd23f9b84f48170650980f4dbccd4',
    privateKey: 'a355ff8a12d0d9824536c9ea5a99d01ebee4e18c4468aa7f8edf01c53011be78'
}

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


deployContract(ethAccount.address, ethAccount.privateKey, tokenArtifact.bytecode).then(async value => {
    console.log(value.contractAddress)
    const asset = {
        name: 'ethereum ERC20 token',
        timestamp: Date.now()
    }
    // Mint token in BigchainDB
    const bdbToken = await bdb.createNewDivisibleAsset(asset, initialSupply)
    updateConfig('tokenId', bdbToken.id)
    tokenContract.at(value.contractAddress).then(instance => {
        instance.Transfer().watch(async (err, result) => {
            if (!err) {
                const {
                    from,
                    to,
                    value
                } = result.args;
                const newBdbUser = bdb.createKeypair('random number will be')
                const transferBdb = await bdb.transferTokens(undefined, bdbToken.id, transferAmount, newBdbUser.publicKey)
            }
            return instance;
        });
    })
})


// Update with the asset id of the token
async function updateConfig(id, value) {
    const env = jetpack.cwd(__dirname).read('../config/bigchaindb.config.json', 'json');
    env[id] = value
    jetpack.cwd(__dirname).write('../config/bigchaindb.config.json', env);
}