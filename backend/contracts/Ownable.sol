// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.4;

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