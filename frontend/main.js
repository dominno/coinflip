var web3 = new Web3(Web3.givenProvider);
var contractAddress = "0x56a726966ABFdC9e8B0D34F3aAc48A56a49d7C31";
var contractInstance;
var subscription;
ethereum.autoRefreshOnNetworkChange = true;


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
    await window.ethereum.enable().then(function (accounts) {
        contractInstance = new web3.eth.Contract(abi, contractAddress, { from: web3.currentProvider.selectedAddress }); 
    });
};


async function getBalance(address){
    return web3.utils.fromWei( await web3.eth.getBalance(address), "ether" );    
};

function initDapp() {   

    contractInstance.methods.procesingAddresses(web3.currentProvider.selectedAddress).call().then(function (isProcessing) {
        console.log("player waiting?", isProcessing);
        console.log("sprawdzam");
        if (isProcessing) {
            $("#betProcessingCard").show();
            console.log("makeBetCard hide");
            $("#makeBetCard").hide();
        } else {            
            $("#betProcessingCard").hide();
            console.log("makeBetCard show");
            $("#makeBetCard").show();
        }
    }) 

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
    var val = await contractInstance.methods.procesingAddresses(web3.currentProvider.selectedAddress).call();
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

function withdrawFundsFromContract()
{
    contractInstance.methods.withdrawFromContract().send()
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


function toogleUserBetProcessing()
{
    contractInstance.methods.toggleProcesingAddresses(web3.currentProvider.selectedAddress).send()
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
    })
    .on("receipt", function(receipt){
            $("#betProcessingCard").show();
            $("#makeBetCard").hide();
            UpdateDisplay();                 
    })
    .on("error", function(error){
        console.log(error);
    }); 

    contractInstance.once("betFinished", function (err, res) {
        if (res.returnValues.win == true) {
            Swal.fire(
            'You won!',
            'Try again',
            'success'
            )
        }            
        else {
            Swal.fire(
            'You lost!',
            'Try again',
            'error'
            )
        };
        $("#betProcessingCard").hide();
        $("#makeBetCard").show();
        UpdateDisplay();
      })
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
    let betStarted;
    
    try {
        contractInstance.getPastEvents('betFinished', {
            filter: {player: web3.currentProvider.selectedAddress, win:true},
            fromBlock: 0,
            toBlock: 'latest'
        })
            .then(function (eventsStreamWin) {
                betWinEvents = eventsStreamWin.filter(function (event) {                
                    return event.returnValues.win == true;
                });
            $('#winEvents').text(betWinEvents.length)         
        });
    }
    catch(err) {
        $('#winEvents').text('0');
    }

    try {
        contractInstance.getPastEvents('betFinished', {
            filter: {player: web3.currentProvider.selectedAddress, win:false},
            fromBlock: 0,
            toBlock: 'latest'
        })
            .then(function (eventsStreamLost) {
            betLostEvents = eventsStreamLost.filter(function (event) {
                return event.returnValues.win == false
            });
            $('#lostEvents').text(betLostEvents.length)         
            });
    }
    catch(err) {
        $('#lostEvents').text('0');
    }
}


$(document).ready(function () {
    detectMetamask().then(function () {
        initDapp();
        
        
    });
    $("#DepositButton").click( deposit );
    $("#WithdrawButton").click( withdraw );
    $("#BetButton").click( bet );
});



