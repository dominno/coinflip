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

function depositFunds(valueEther)
{
    var config = {
        value: web3.utils.toWei(valueEther.toString(), "ether").toString(),
        from: web3.currentProvider.selectedAddress
    };
    contractInstance.methods.deposit().send(config)
    .on("transactionHash",function(hash){
            console.log(hash);
        })
    .on("confirmation", function(confirmationNr){
            console.log(confirmationNr);
         })
    .on("receipt", function(receipt){
            console.log(receipt); 
            UpdateDisplay();                 
    })
    .on("error", function(error){
        console.log(error);
    });    
}

function withdrawFunds(valueEther)
{
    let value = web3.utils.toWei(valueEther.toString(), "ether").toString();
    contractInstance.methods.withdraw(value).send()
    .on("transactionHash",function(hash){
            console.log(hash);
        })
    .on("confirmation", function(confirmationNr){
            console.log(confirmationNr);
         })
    .on("receipt", function(receipt){
            console.log(receipt); 
            UpdateDisplay();                 
    })
    .on("error", function(error){
        console.log(error);
    });    
}

function betSend(side, valueEther)
{
    contractInstance.methods.bet(side, valueEther.toString()).send()
    .on("transactionHash",function(hash){
            console.log(hash);
        })
    .on("confirmation", function(confirmationNr){
            console.log(confirmationNr);
         })
    .on("receipt", function(receipt){
            console.log(receipt); 
            UpdateDisplay();                 
    })
    .on("error", function(error){
        console.log(error);
    });    
}

function deposit()
{   
    let value = $("#DepositInputAmount").val()
    depositFunds(value);
}

function withdraw()
{   
    let value = $("#DepositInputAmount").val()
    withdrawFunds(value);
}

function bet()
{   
    let value = web3.utils.toWei($("#BetInputAmount").val().toString(), "ether").toString();
    let side = 0;
    betSend(side, value);
}

function UpdateDisplay()
{
    DisplayBalance().then( DisplayContractBalance()).then( DisplayPlayerBalance()).then( GetPlayerEvents() );
}

function GetPlayerEvents()
{
    let winsEvents;
    let lostEvents;
    contractInstance.getPastEvents('betWin', {
        filter: {player: [web3.currentProvider.selectedAddress]},
        fromBlock: 0,
        toBlock: 'latest'
    })
    .then(function(eventsStream){
        winsEvents = eventsStream.map(function(event) {
            return event.returnValues;
        });
        $('#winEvents').text(winsEvents.length)         
    });
    contractInstance.getPastEvents('betLost', {
        filter: {player: web3.currentProvider.selectedAddress},
        fromBlock: 0,
        toBlock: 'latest'
    })
    .then(function(eventsStream){
        lostEvents = eventsStream.map(function(event) {
            return event.returnValues;
        });  
        $('#lostEvents').text(lostEvents.length)         
    });
}


$(document).ready(function() {
    detectMetamask().then(function(){
        initDapp();
    });
    $("#DepositButton").click( deposit );
    $("#WithdrawButton").click( withdraw );
    $("#BetButton").click( bet );
    
    

    

});