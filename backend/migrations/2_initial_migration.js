const CoinFlip = artifacts.require("CoinFlip");

module.exports = function(deployer) {
  if(deployer.network == "development" || deployer.network == "test"){
    deployer.deploy(CoinFlip, {value: web3.utils.toWei("10", "ether")});
  } else {
    deployer.deploy(CoinFlip, {value: web3.utils.toWei("1", "ether")});
  } 
};
