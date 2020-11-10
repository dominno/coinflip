var web3 = new Web3(Web3.givenProvider);
var contractAddress = "0xbDdd433fF75fDB71249BDB3ad550a08152cE2d35";
var contractInstance;
ethereum.autoRefreshOnNetworkChange = false;

async function detectMetamask() {
    if (typeof web3 !== 'undefined') {
        if (web3.currentProvider != null && web3.currentProvider.isMetaMask === true) {
            await enableEthereum();
        } else {
            $('#metamaskAlert').modal({
                backdrop: 'static', 
                keyboard: false}
            );
        }    
    } else {
          alert('web3 is not found');
    }
}

async function enableEthereum() {
    await window.ethereum.enable().then(function(accounts){       
        contractInstance = new web3.eth.Contract(abi,contractAddress,{from: web3.currentProvider.selectedAddress});
      });
};


async function getBalance(address){
    return web3.utils.fromWei( await web3.eth.getBalance(address), "ether" );    
};

function initDapp() {
    UpdateDisplay();
    $("#account-address").text(web3.currentProvider.selectedAddress);
    
}

async function DisplayBalance()
{
    getBalance(web3.currentProvider.selectedAddress).then(function(balance){
        $("#account-balance").text(balance);
    })
    
}

async function DisplayPlayerBalance()
{
    var playerBalance = web3.utils.fromWei( await contractInstance.methods.playerBalance(web3.currentProvider.selectedAddress).call(), "ether" );
    $('#playerBalance').text( playerBalance );
    
}

async function DisplayContractBalance()
{
    var contractBalance = web3.utils.fromWei( await contractInstance.methods.balance().call(), "ether" );
    $('#contractBalance').text( contractBalance );
}




async function depositFunds(valueEther)
{
    var config = {
        value: web3.utils.toWei(valueEther, "ether"),
        from: web3.currentProvider.selectedAddress
    };
    console.log(config);
    alert('22');
    contractInstance.methods.deposit().send(config)
    .on("transactionHash",function(hash){
            console.log(hash);
            alert('22');
        })
    .on("confirmation", function(confirmationNr){
            console.log(confirmationNr);
            alert('22');

         })
    .on("receipt", function(receipt){
            console.log(receipt);              
            alert('22');
    })
    .on("error", function(error){
        alert(error);
        alert('22');
    });
    
}

function deposit()
{   
    console.log($("#DepositInputAmount").val());
    depositFunds($("#DepositInputAmount").val()).then( UpdateDisplay() );
}

function UpdateDisplay()
{
    DisplayBalance().then( DisplayContractBalance()).then( DisplayContractBalance() );
}



$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){       
        contractInstance = new web3.eth.Contract(abi,contractAddress,{from: web3.currentProvider.selectedAddress});
      });
    detectMetamask().then(function(){
        initDapp();
    });

    $("#DepositButton").click( deposit );
    
    

    

});