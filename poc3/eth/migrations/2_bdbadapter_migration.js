var BdbAdapter = artifacts.require("./BdbAdapter.sol");

module.exports = function(deployer) {
  deployer.deploy(BdbAdapter,"http://eth-bdb.westeurope.cloudapp.azure.com:4000/query", 10);
};
