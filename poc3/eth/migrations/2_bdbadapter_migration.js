var BdbAdapter = artifacts.require("./BdbAdapter.sol");

module.exports = function(deployer) {
  deployer.deploy(BdbAdapter,"<host of BigchainDB Query engine>", 10);
};
