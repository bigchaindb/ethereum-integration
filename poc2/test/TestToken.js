import Web3 from 'web3';
import tokenConfig from '../config/token.config.json';
import network from '../config/network.config.json';

const web3 = new Web3(new Web3.providers.WebsocketProvider(network.ethereum.host));
const contract = new web3.eth.Contract(tokenConfig.abi, tokenConfig.address);

//console.log('Result: ',result);

contract.events.Transfer({
    fromBlock: 0,
    toBlock: 'latest'
}, async function (err, event) {
    console.log(err, event);
});

const result = contract.methods.transfer('0x7b39b8bedd76753e8b7657bce9d6fc42fdc30d78', 10);
console.log('tx executed');