import Web3 from 'web3';
import jetpack from 'fs-jetpack'
import tokenConfig from '../config/token.config.json';
import network from '../config/network.config.json';
import keys from '../config/keys.config.json';
import bdb from './bdb'

const web3 = new Web3(new Web3.providers.WebsocketProvider(network.ethereum.host));
const contract = new web3.eth.Contract(tokenConfig.abi, tokenConfig.address);
//Define bigchaindb asset
const asset = {
    name: tokenConfig.name,
    symbol: tokenConfig.symbol,
    ethereumAddress: tokenConfig.address,
    timestamp: Date.now()
}

let bdbId = tokenConfig.bigchaindbId;

async function mintAndListen() {
    // Mint token in BigchainDB if id not present
    if (!bdbId || bdbId <= 0) {
        const bdbToken = await bdb.createNewDivisibleAsset(asset, tokenConfig.supply, keys.adminPassphrase);
        bdbId = bdbToken.id;
        updateConfig('bdbId', bdbId);
    }
    //Listen to the event (in this case Transfer) and replicate the transaction on bigchaindb 
    contract.events.Transfer({}, async function (err, event) {
        if (!err) {
            const newBdbUser = bdb.createKeypair(keys.userPasssphrse)
            await bdb.transferTokens(keys.adminPassphrase, bdbId, event.returnValues.value, newBdbUser.publicKey)
        } else {
            console.log(err);
        }
    });
};

async function updateConfig(id, value) {
    const env = jetpack.cwd(__dirname).read('../config/token.config.json', 'json');
    env[id] = value
    jetpack.cwd(__dirname).write('../config/token.config.json', env);
}

// start the listener
mintAndListen();