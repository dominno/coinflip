const MockedCoinFlip = artifacts.require("MockedCoinFlip");

module.exports = function(deployer) {
  deployer.deploy(MockedCoinFlip, {value: web3.utils.toWei("10", "ether")});
};
