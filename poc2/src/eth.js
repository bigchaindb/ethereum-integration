import Web3 from 'web3';
import jetpack from 'fs-jetpack'
import tokenConfig from '../config/token.config.json';
import network from '../config/network.config.json';
import keys from '../config/keys.config.json';

import {default as contract } from 'truffle-contract';
import tokenArtifact from '../build/contracts/Token.json'

import bdb from './bdb'

const tokenContract = contract(tokenArtifact);
tokenContract.setProvider(new Web3.providers.HttpProvider(network.ethereum.host));
tokenContract.defaults({from: network.ethereum.fromAddress})
if (typeof tokenContract.currentProvider.sendAsync !== "function") {
    tokenContract.currentProvider.sendAsync = function() {
      return tokenContract.currentProvider.send.apply(
        tokenContract.currentProvider, arguments
      );
    };
  }


//Define bigchaindb asset
const asset = {
    name: tokenConfig.name,
    symbol: tokenConfig.symbol,
    ethereumAddress: tokenConfig.address,
    timestamp: Date.now()
}

let bdbId = tokenConfig.bdbId;

async function mintAndListen() {
    // Mint token in BigchainDB if id not present
    if (!bdbId || bdbId <= 0) {
        const bdbToken = await bdb.createNewDivisibleAsset(asset, tokenConfig.supply, keys.adminPassphrase);
        bdbId = bdbToken.id;
        updateConfig('bdbId', bdbId);
    }
    //Listen to the event (in this case Transfer) and replicate the transaction on bigchaindb 
    tokenContract.deployed().then(contract => {
        contract.Transfer(async (err, event) => {
        if (!err) {
            const newBdbUser = bdb.createKeypair(keys.userPasssphrse)
            await bdb.transferTokens(keys.adminPassphrase, bdbId, event.args.value, newBdbUser.publicKey)
        } else {
            console.log(err);
        }
    })
    })
};

async function updateConfig(id, value) {
    const env = jetpack.cwd(__dirname).read('../config/token.config.json', 'json');
    env[id] = value
    jetpack.cwd(__dirname).write('../config/token.config.json', env);
}

// start the listener
mintAndListen();