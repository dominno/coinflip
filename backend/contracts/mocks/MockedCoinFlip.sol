// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.4;

// mocked version of CoinFlip contract - *only* used in tests

import "../CoinFlip.sol";


contract MockedCoinFlip is CoinFlip {

    uint public fakeRandomValue;

    constructor() payable {
        balance = msg.value;   
    }

    function getRandom() virtual public view override returns(uint){
        return fakeRandomValue;
    }

    function _mock_setfakeRandomValue(uint256 value) public {
        fakeRandomValue = value;
    }

}
