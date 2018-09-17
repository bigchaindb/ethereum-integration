// requires
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const config = require("dotenv").config();

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

const bdbAdapterInstance = require("../build/contracts/BdbAdapter.json");
const bdbAdapter = new web3.eth.Contract(bdbAdapterInstance.abi, config.parsed.BDBADAPTERADDRESS, {
  from: config.parsed.FROMADDRESS
});

function sendPayment(bdbPublicKey, sendTo, sendAmount, dateFrom, dateTo){
  const encoded = bdbAdapter.methods.sendPayment(bdbPublicKey, sendTo, sendAmount, dateFrom, dateTo).encodeABI()
  const tx = {
    to: config.parsed.BDBADAPTERADDRESS,
    gas: web3.utils.toHex(web3.utils.toWei("0.0012","gwei")),
    gasPrice: web3.utils.toHex(web3.utils.toWei("23000","wei")),
    value: web3.utils.toHex(web3.utils.toWei("0.012","ether")),//+parseInt(config.parsed.ORACLEGAS)
    data: encoded
  }
  web3.eth.accounts.signTransaction(tx, "0x"+config.parsed.FROMADDRESSPRIVKEY).then(signed => {
    web3.eth.sendSignedTransaction(signed.rawTransaction);
  });
}

web3.eth.getBalance(config.parsed.FROMADDRESS).then((data) => {
  console.log("ether balance: ",data);
});

const from = new Date("2015,02,06").getTime().toString();
const to = new Date("2017,12,30").getTime().toString();
const amount = web3.utils.toWei("0.01","ether");
// sendPayment(<public key of BDB asset owner>, <eth address of receiving>, <send ethereum amount>)
sendPayment("HAz6LuLNTpijaR5aJMdX5eBUDSaHzP9WJaJnbu3oGert","0xc75aa08c2fBf9EC7580650d8dc74BFb12a5Cd343"
,amount,from, to)

bdbAdapter.events.allEvents(function(error, result){
  if (!error)
    console.log(result);
});


