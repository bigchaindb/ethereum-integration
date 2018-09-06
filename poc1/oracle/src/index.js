// requires
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const config = require("dotenv").config();

const web3 = new Web3(`https://rinkeby.infura.io/v3/${config.parsed.INFURAKEY}`);

const bdbAdapterInstance = require("../build/contracts/BdbAdapter.json");
const bdbAdapter = new web3.eth.Contract(bdbAdapterInstance.abi, config.parsed.BDBADAPTERADDRESS, {
  from: config.parsed.FROMADDRESS
});
const oraclePayment = 500000;

function sendPayment(sendTo,bdbPublicKey){
  const encoded = bdbAdapter.methods.sendPayment(sendTo,bdbPublicKey).encodeABI()
  const tx = {
    to: config.parsed.BDBADAPTERADDRESS,
    gas: web3.utils.toHex(7000000),
    value: web3.utils.toHex(1+oraclePayment),
    data: encoded
  }
  web3.eth.accounts.signTransaction(tx, "0x"+config.parsed.FROMADDRESSPRIVKEY).then(signed => {
    web3.eth.sendSignedTransaction(signed.rawTransaction);
  });
}

// sendPayment(<eth address of receiving>,<public key of BDB asset owner>)
sendPayment("0x0408f7f82745fdcec2bdc9bdaae8e32795a0c716","3gep1cRMHdB1ri6ohHdsHRJ4xPyYsyFMnE6cj83NNjpr")

/*
// get ether balance
web3.eth.getBalance(config.parsed.FROMADDRESS).then((data) => {
  console.log("ether balance: ",data);
});
// get variable amount
bdbAdapter.methods.amount().call({from: "0x55164001b525c601ecee49decaec407f5fcc2890"})
  .then(result => console.log("result", result))
  .catch(error => console.log("error", error));
*/