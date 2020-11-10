var web3 = new Web3(Web3.givenProvider);
var address = "0x116b8E810E255CA3A099d20ef6CcB06A41ea7219";
var contractInstance;

var alert = `<div class="alert alert-dismissible fade show" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`

$(document).ready(function() {



    window.ethereum.enable().then(async function(accounts) {
        contractInstance = new web3.eth.Contract(abi, address, {from: accounts[0]});
        
        console.log(contractInstance);
       
        contractInstance.events.allEvents()
            .on('data', function(event){
                if(event.event == "flipWon") {
                    let winningAlert = $.parseHTML(alert);
                    $(winningAlert).addClass("alert-success");
                    $(winningAlert).prepend("<strong>Flip Won!</strong> Your winnings have been transferred.");
                    $("#bet-alerts").prepend(winningAlert);
                    setTimeout(() => $(winningAlert).alert('close'), 5000);
                } else if (event.event == "flipLost") {
                    let losingAlert = $.parseHTML(alert);
                    $(losingAlert).addClass("alert-danger");
                    $(losingAlert).prepend("<strong>Flip Lost</strong> Thanks for playing!");
                    $("#bet-alerts").prepend(losingAlert);
                    setTimeout(() => $(losingAlert).alert('close'), 5000);
                } else if (event.event == "coinFlipped") {
                    let flippedAlert = $.parseHTML(alert);
                    $(flippedAlert).addClass("alert-primary");
                    if(event.returnValues.result == "0")
                    {
                        $(flippedAlert).prepend("<strong>Heads</strong>");
                    } else {
                        $(flippedAlert).prepend("<strong>Tails</strong>");
                    }
                    $("#bet-alerts").prepend(flippedAlert);
                    setTimeout(() => $(flippedAlert).alert('close'), 5000);
                }
            });
    });

    $("#place_bet_button").click(placeBet);

});

async function placeBet(){
    var prediction = parseInt($("#prediction").val());
    var bet = parseFloat($("#bet_input").val()) * (10 ** 18); //convert to Wei
    var balance = await contractInstance.methods.balance().call();
    balance = parseFloat(balance);
    
    if(balance >= bet && bet > 0) {
        contractInstance.methods.settleBet(prediction).send({value: bet})
    } else {
        let warning = $.parseHTML(alert);
        $(warning).addClass("alert-danger");
        $(warning).prepend("Bet must be <strong>greater</strong> than 0 and <strong>less</strong> than " + balance/(10**18) + " ETH.");
        $("#bet-alerts").prepend(warning);
        setTimeout(() => $(warning).alert('close'), 5000);
    }
}