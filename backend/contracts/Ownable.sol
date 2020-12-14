// SPDX-License-Identifier: GPL-3.0
pragma solidity > 0.6.1 < 0.7.0;

contract Ownable{
    address public owner;
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _; //Continue execution
    }
    
    constructor() public{
        owner = msg.sender;
    }
    
}