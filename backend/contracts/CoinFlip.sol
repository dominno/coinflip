// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.4;


contract CoinFlip {

    uint public balance;
    mapping(address => uint) public playerBalance;

    // events
    event betWin();
    event betLost();

    event Deposit(address user, uint256 amount, uint256 balance);
    event Withdraw(address user, uint256 amount, uint256 balance);

    constructor() payable {
        balance = msg.value;   
    }

    modifier costs(uint256 cost){
        require(msg.value >= cost, "bet should more than 1");
        _;
    }

    function bet(uint side, uint value) public {
        require(side == 0 || side == 1, "side must be head(0) or tail(1)");
        require(balance >= value);
        require(playerBalance[msg.sender] >= value);
        address payable player = msg.sender;
        uint betResult = getRandom();
        if (side == betResult) {
            transferToPlayer(player, value);
            emit betWin();
        } else {
            transferToBalance(player, value);
            emit betLost();
        }
    }

    function deposit() public payable costs(1 ether) {
        playerBalance[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, playerBalance[msg.sender]);
    }

    function getRandom() virtual public view returns(uint){
        return block.timestamp % 2;
    }

    function transferToPlayer(address payable player, uint value) private {
        balance -= value;
        playerBalance[player] += value; 
    }

    function transferToBalance(address payable player, uint value) private {
        balance += value;
        playerBalance[player] -= value;
    }

    function withdraw() public {
        require(playerBalance[msg.sender] > 0);
        uint amount = playerBalance[msg.sender];
        playerBalance[msg.sender] = 0;
        msg.sender.transfer(amount);
   }
}
