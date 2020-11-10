const CoinFlip = artifacts.require("CoinFlip");

module.exports = function(deployer) {
  deployer.deploy(CoinFlip, {value: web3.utils.toWei("10", "ether")});
};
