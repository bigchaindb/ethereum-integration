var BdbAdapter = artifacts.require("./BdbAdapter.sol");

module.exports = function(deployer) {
  deployer.deploy(BdbAdapter);
};