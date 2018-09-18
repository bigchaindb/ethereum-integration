var Web3 = require('web3');
const { waitForEvent } = require('./utils');
var BdbAdapter = artifacts.require('BdbAdapter');
var testparams = require('./TestParam.json');

var web3 = new Web3(new Web3.providers.HttpProvider(testparams.ethereum.host));

contract('BigchainDB Adapter Contract Test', () => {
    describe('End-To-End POC3 Oraclize Test', async () => {
        it('Should log new output result event and balance should be updated', async () => {
            const {
                contract
            } = await BdbAdapter.deployed();
            const expected = testparams.queryEngine.expected_value;
            let balance = 0;
            web3.eth.getBalance(testparams.ethereum.to_address).then(result => {balance = result});
            contract.sendPayment(testparams.bigchaindb.owner, testparams.ethereum.to_address, testparams.ethereum.amount,"","", {
                from: testparams.ethereum.from_address,
                gas: testparams.ethereum.gas,
                value: testparams.ethereum.value
            }), {
                args: {
                    outputResult
                }
            } = await waitForEvent(contract.NewOutputResult({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }));
            
            web3.eth.getBalance(testparams.ethereum.to_address).then(newBalance => {
                assert.equal(outputResult, expected);
                assert.equal(newBalance, balance + testparams.ethereum.amount);
            });
            
        });
    })
});