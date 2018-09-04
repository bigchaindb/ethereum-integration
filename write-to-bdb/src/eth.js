import Web3 from 'web3';
import tokenArtifact from '../build/contracts/Token.json';
const ETH_HOST = 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.WebsocketProvider(ETH_HOST));

function deployContract(fromAddr, artifact, args = ['BDB Token', 'BDBT', 100000000]){
    return new web3.eth.Contract(artifact.abi).deploy({data: artifact.bytecode, arguments: args}).send({
        from: fromAddr,
        gas: 1500000
    });
}

deployContract('0xd004c393b8daacb1cab95779331f803c8644bb9a', tokenArtifact)
.then(contract => {
    // add publish token code here
    console.log(contract._address);
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