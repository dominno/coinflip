// SPDX-License-Identifier: GPL-3.0
pragma solidity > 0.6.1 < 0.7.0;

// mocked version of CoinFlip contract - *only* used in tests

import "../CoinFlip.sol";


contract MockedCoinFlip is CoinFlip {

    uint public fakeRandomValue;

    constructor() payable public {
        balance = msg.value;   
    }

    function getRandom(string memory _result) virtual internal view override returns(uint){
        return fakeRandomValue;
    }

    function makeProvableQuery() virtual internal override returns(bytes32){
        return 0x7465737400000000000000000000000000000000000000000000000000000000;
    }    

    function _mock_setfakeRandomValue(uint256 value) public {
        fakeRandomValue = value;
    }

    function isProvableAddress() virtual public payable override returns(bool){
        return true;
    }

    

}
