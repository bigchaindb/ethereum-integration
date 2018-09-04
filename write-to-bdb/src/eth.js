import Web3 from 'web3';
import tokenArtifact from '../build/contracts/Token.json';
import ganache from 'ganache-cli';
const ETH_HOST = 'http://127.0.0.1:8545'
const web3 = new Web3(ganache.provider());


function deployContract(fromAddr, artifact, args = ['BDB Token', 'BDBT', 100000000]){
    return new web3.eth.Contract(artifact.abi).deploy({data: artifact.bytecode, arguments: args}).send({
        from: fromAddr,
        gas: 1500000
    });
}

deployContract('0x344abf1c45e8a68f387736aa381ba1843441bcb9', tokenArtifact)
.then(contract => {
    // add publish token code here
    contract.events.Transfer((err, event) => {
        if(!err){
            //transfer token in bdb here
            console.log(event);
        }else{
            console.log('Error: ', err);
        }
    })
})
.catch(err => console.log(err));