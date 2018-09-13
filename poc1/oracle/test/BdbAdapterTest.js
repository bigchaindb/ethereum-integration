const {waitForEvent} = require('./utils');
var BdbAdapter = artifacts.require('BdbAdapter');
var testparams = require('./TestParam.json');

contract('BigchainDB Adapter Contract Test', () => {
    describe('End-To-End POC1 Oraclize Test', async () => {
        it('Should log new asset query event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = "json("+testparams.bigchaindb.host+"/api/v1/outputs?spent=false&public_key="+testparams.bigchaindb.public_key+").0.transaction_id";
            contract.sendPayment(testparams.bigchaindb.public_key, testparams.ethereum.to_address
            ,testparams.ethereum.amount, {from: testparams.ethereum.from_address, gas: testparams.ethereum.gas, value: testparams.ethereum.value})
          , {args:{assetQuery}} = await waitForEvent(contract.newAssetQuery({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(assetQuery, expected);
        });

        it('Should log new output result event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = testparams.bigchaindb.expected_tx;
            contract.sendPayment(testparams.bigchaindb.public_key, testparams.ethereum.to_address
                ,testparams.ethereum.amount, {from: testparams.ethereum.from_address, gas: testparams.ethereum.gas, value: testparams.ethereum.value})
          , {args:{outputResult}} = await waitForEvent(contract.newOutputResult({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(outputResult, expected);
        });

        it('Should log new output query event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = "json("+testparams.bigchaindb.host+"/api/v1/transactions/"+testparams.bigchaindb.expected_tx+").asset.data";
            contract.sendPayment(testparams.bigchaindb.public_key, testparams.ethereum.to_address
                ,testparams.ethereum.amount, {from: testparams.ethereum.from_address, gas: testparams.ethereum.gas, value: testparams.ethereum.value})
          , {args:{outputQuery}} = await waitForEvent(contract.newOutputQuery({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(outputQuery, expected);
        });

        it('Should log new asset result event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = testparams.bigchaindb.expected_asset_data;
            contract.sendPayment(testparams.bigchaindb.public_key, testparams.ethereum.to_address
                ,testparams.ethereum.amount, {from: testparams.ethereum.from_address, gas: testparams.ethereum.gas, value: testparams.ethereum.value})
          , {args:{assetResult}} = await waitForEvent(contract.newAssetResult({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(assetResult, expected);
        });
    })
});