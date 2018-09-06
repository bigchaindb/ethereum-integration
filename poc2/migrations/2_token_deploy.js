var Token = artifacts.require("./Token.sol");
var tokenConfig = require("../config/token.config.json");
module.exports = function(deployer) {
  deployer.deploy(Token, tokenConfig.name, tokenConfig.symbol, tokenConfig.supply);
};
