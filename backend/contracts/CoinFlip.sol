// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.4;
import "./Ownable.sol";


contract CoinFlip is Ownable{

    uint public balance;
    mapping(address => uint) public playerBalance;

    // events
    event betWin(address indexed player, uint256 amount);
    event betLost(address indexed player, uint256 amount);

    event Deposit(address indexed user, uint256 amount, uint256 balance);
    event Withdraw(address indexed user, uint256 amount, uint256 balance);

    event DepositToContract(address indexed user, uint256 amount, uint256 balance);
    event WithdrawFromContract(address indexed user, uint256 amount, uint256 balance);

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
            emit betWin(player, value);
        } else {
            transferToBalance(player, value);
            emit betLost(player, value);
        }
    }

    function deposit() public payable costs(1 ether) {
        playerBalance[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, playerBalance[msg.sender]);
    }

    function depositToContract() public payable onlyOwner costs(1 ether) {
        balance += msg.value;
        emit DepositToContract(msg.sender, msg.value, balance);
    }

    function withdrawFromContract() public onlyOwner {
        require(balance > 0);
        uint toTransfer = balance;
        balance = 0;
        msg.sender.transfer(toTransfer);
        emit WithdrawFromContract(msg.sender, toTransfer, balance);
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

    function withdraw(uint amount) public {
        require(playerBalance[msg.sender] >= amount);
        require(amount > 0);
        playerBalance[msg.sender] -= amount;
        msg.sender.transfer(amount);
   }
}
