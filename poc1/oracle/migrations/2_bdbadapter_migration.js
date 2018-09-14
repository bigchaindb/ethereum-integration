var BdbAdapter = artifacts.require("./BdbAdapter.sol");

const locationAddress = "109006 Burgos";

module.exports = function(deployer) {
  deployer.deploy(BdbAdapter, "https://test.bigchaindb.com", locationAddress);
};
