// requires
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const config = require("dotenv").config();

const web3 = new Web3(`https://rinkeby.infura.io/v3/${config.parsed.INFURAKEY}`);

const bdbAdapterInstance = require("../build/contracts/BdbAdapter.json");
const bdbAdapter = new web3.eth.Contract(bdbAdapterInstance.abi, config.parsed.BDBADAPTERADDRESS, {
  from: config.parsed.FROMADDRESS
});

function sendPayment(bdbPublicKey, sendTo, sendAmount, dateFrom, dateTo){
  const encoded = bdbAdapter.methods.sendPayment(bdbPublicKey, sendTo, sendAmount, dateFrom, dateTo).encodeABI()
  const tx = {
    to: config.parsed.BDBADAPTERADDRESS,
    gas: web3.utils.toHex(7000000),
    value: web3.utils.toHex(sendAmount+parseInt(config.parsed.ORACLEGAS)),
    data: encoded
  }
  web3.eth.accounts.signTransaction(tx, "0x"+config.parsed.FROMADDRESSPRIVKEY).then(signed => {
    web3.eth.sendSignedTransaction(signed.rawTransaction);
  });
}

// sendPayment(<public key of BDB asset owner>, <eth address of receiving>, <send ethereum amount>)
sendPayment("3gep1cRMHdB1ri6ohHdsHRJ4xPyYsyFMnE6cj83NNjpr","0x0408f7f82745fdcec2bdc9bdaae8e32795a0c716"
,100, "08/08/2018", "09/10/2018")

/*
// get ether balance
web3.eth.getBalance(config.parsed.FROMADDRESS).then((data) => {
  console.log("ether balance: ",data);
});
// get variable amount
bdbAdapter.methods.amount().call()
  .then(result => console.log("result", result))
  .catch(error => console.log("error", error));
*/