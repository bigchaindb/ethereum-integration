const {waitForEvent} = require('./utils');
var BdbAdapter = artifacts.require('BdbAdapter');

contract('BigchainDB Adapter Contract Test', () => {
    describe('End-To-End POC1 Oraclize Test', async () => {
        it('Should log new asset query event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = "json(https://test.bigchaindb.com/api/v1/outputs?spent=false&public_key=3gep1cRMHdB1ri6ohHdsHRJ4xPyYsyFMnE6cj83NNjpr).0.transaction_id";
            contract.sendPayment("3gep1cRMHdB1ri6ohHdsHRJ4xPyYsyFMnE6cj83NNjpr","0x7474ca533d8a5162a044b090f7f01003d1868b4b"
            ,100, {from: "0x1bc887ca181eb3d4fa59e6c74d826f74f99e45fa", gas: 5000000, value: 10000000000000100})
          , {args:{assetQuery}} = await waitForEvent(contract.newAssetQuery({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(assetQuery, expected);
        });

        it('Should log new output result event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = "cc5f6d7ce4ea57b59f51ac14fe6e17632134aaf6469fab3713c7e92dc6d2fb94";
            contract.sendPayment("3gep1cRMHdB1ri6ohHdsHRJ4xPyYsyFMnE6cj83NNjpr","0x7474ca533d8a5162a044b090f7f01003d1868b4b"
            ,100, {from: "0x1bc887ca181eb3d4fa59e6c74d826f74f99e45fa", gas: 5000000, value: 10000000000000100})
          , {args:{outputResult}} = await waitForEvent(contract.newOutputResult({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(outputResult, expected);
        });

        it('Should log new output query event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = "json(https://test.bigchaindb.com/api/v1/transactions/cc5f6d7ce4ea57b59f51ac14fe6e17632134aaf6469fab3713c7e92dc6d2fb94).asset.data";
            contract.sendPayment("3gep1cRMHdB1ri6ohHdsHRJ4xPyYsyFMnE6cj83NNjpr","0x7474ca533d8a5162a044b090f7f01003d1868b4b"
            ,100, {from: "0x1bc887ca181eb3d4fa59e6c74d826f74f99e45fa", gas: 5000000, value: 10000000000000100})
          , {args:{outputQuery}} = await waitForEvent(contract.newOutputQuery({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(outputQuery, expected);
        });

        it('Should log new asset result event ', async () => {
            const {contract} = await BdbAdapter.deployed();
            const expected = '{"latitude": 52.55437486666666, "createdOn": "Thu Sep 06 2018 14:17:00 GMT+0200 (Central European Summer Time)", "longitude": 13.29124493333333}';
            contract.sendPayment("3gep1cRMHdB1ri6ohHdsHRJ4xPyYsyFMnE6cj83NNjpr","0x7474ca533d8a5162a044b090f7f01003d1868b4b"
            ,100, {from: "0x1bc887ca181eb3d4fa59e6c74d826f74f99e45fa", gas: 5000000, value: 10000000000000100})
          , {args:{assetResult}} = await waitForEvent(contract.newAssetResult({}, {fromBlock: 0, toBlock: 'latest'}));
          assert.equal(assetResult, expected);
        });
    })
});