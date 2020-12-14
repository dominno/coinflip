const MockedCoinFlip = artifacts.require("MockedCoinFlip");

module.exports = function(deployer) {
  if(deployer.network == "development" || deployer.network == "test"){
    deployer.deploy(MockedCoinFlip, {value: web3.utils.toWei("10", "ether")});
  }  
};    


