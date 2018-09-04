import Web3 from 'web3';
import tokenArtifact from '../build/contracts/Token.json';
import globals from '../config/globals.config.json';

const ETH_HOST = 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(ETH_HOST));

function deployContract(fromAddr, artifact, args = ['BDB Token', 'BDBT', 100000000]) {
    return new web3.eth.Contract(artifact.abi).deploy({
        data: artifact.bytecode,
        arguments: args
    }).send({
        from: fromAddr,
        gas: 1500000
    });
}

function getEthereumKeypair(passphrase = globals.userPasssphrse) {
    return web3.eth.personal.newAccount(passphrase);
}

function unlockAccount(address, passphrase = globals.userPasssphrse, timeout = 1000) {
    return web3.eth.personal.unlockAccount(address, passphrase, timeout);
}

function fundAccount(to, from, ethers) {
    web3.eth.sendTransaction({
        to,
        from,
        value: web3.utils.toWei(String(ethers), "ether")
    })
}

let coinbase = '';
web3.eth.getAccounts().then(arr => {
    coinbase = arr[2]
})
web3.eth.getPastLogs({
    address: '0x8d646a3a388aaece3732090d39ca4b9a7abf9dc7'
}).then(console.log);

getEthereumKeypair().then(address => {
    fundAccount(address, coinbase, 10);
    unlockAccount(address).then(flag => {
        if (flag) {
            deployContract(address, tokenArtifact)
                .then(contract => {
                    contract.events.Transfer({
                        fromBlock: 0
                    }, function (err, res) {
                        console.log(err, res)
                    });
                    contract.methods.transfer('0x8d646a3a388aaece3732090d39ca4b9a7abf9dc7', 100).call({
                            from: address
                        })
                        .then(console.log)
                        .catch(err => console.log('Error: ', err));

                })
                .catch(err => console.log(err));
        }
    })
});