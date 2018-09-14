var Web3 = require('web3');
const { waitForEvent } = require('./utils');
var BdbAdapter = artifacts.require('BdbAdapter');
var testparams = require('./TestParam.json');

var web3 = new Web3(new Web3.providers.HttpProvider(testparams.ethereum.host));

contract('BigchainDB Adapter Contract Test', () => {
    describe('End-To-End POC1 Oraclize Test', async () => {
        it('Should log new output result event ', async () => {
            const {
                contract
            } = await BdbAdapter.deployed();
            const expected = testparams.bigchaindb.expected_value;
            const balance = web3.eth.getBalance(testparams.ethereum.to_address);
            contract.sendPayment(testparams.bigchaindb.assetId, testparams.ethereum.to_address, testparams.ethereum.amount, {
                from: testparams.ethereum.from_address,
                gas: testparams.ethereum.gas,
                value: testparams.ethereum.value
            }), {
                args: {
                    outputResult
                }
            } = await waitForEvent(contract.newOutputResult({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }));
            const newBalance = web3.eth.getBalance(testparams.ethereum.to_address);
            assert.equal(outputResult, expected);
            assert.equal(newBalance, balance + testparams.ethereum.amount);
        });
    })
});