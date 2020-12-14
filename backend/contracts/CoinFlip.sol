// SPDX-License-Identifier: GPL-3.0
pragma solidity > 0.6.1 < 0.7.0;
import "./Ownable.sol";
import"./provableAPI.sol";


contract CoinFlip is Ownable, usingProvable{

    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

    uint public balance;

    mapping(address => uint) public playerBalance;
    mapping(bytes32 => Bet) public procesingQueries;
    mapping(address => bool) public procesingAddresses; 

    struct Bet {                                       
        address payable player;                         
        uint value;     
        uint side;                                
        bool result;                                    
    }
    
    // events
    event betFinished(address indexed player, uint256 amount, bool indexed win);
    event betStarted(address indexed player, uint256 amount, bytes32 queryId);

    event Deposit(address indexed user, uint256 amount, uint256 balance);
    event Withdraw(address indexed user, uint256 amount, uint256 balance);

    event DepositToContract(address indexed user, uint256 amount, uint256 balance);
    event WithdrawFromContract(address indexed user, uint256 amount, uint256 balance);

    event newProvableQuery(string description);

    constructor() payable public {
        provable_setProof(proofType_Ledger);
    }

    modifier costs(uint256 cost){
        require(msg.value >= cost, "bet should more than 1");
        _;
    }

    function bet(uint side, uint256 value) public {
        require(side == 0 || side == 1, "side must be head(0) or tail(1)");
        require(balance >= value);
        require(playerBalance[msg.sender] >= value);
        require(procesingAddresses[msg.sender] == false);
        bytes32 queryId = makeProvableQuery();
        procesingAddresses[msg.sender] = true;
        procesingQueries[queryId] = Bet({player: msg.sender, value: value, side: side, result: false});
        emit betStarted(msg.sender, value, queryId);
    }

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) override public {
        require(isProvableAddress() == true);
         if (
                provable_randomDS_proofVerify__returnCode(
                    _queryId,
                    _result,
                    _proof
                ) != 0
        ) {
        } else {
            uint betResult = getRandom(_result);
            Bet memory lastBet  = procesingQueries[_queryId];
            if (lastBet.side == betResult) {
                lastBet.result = true;
                transferToPlayer(lastBet.player, lastBet.value);
            } else {
                lastBet.result = false;
                transferToBalance(lastBet.player, lastBet.value);                
            }
            procesingAddresses[lastBet.player] = false;
            emit betFinished(lastBet.player, lastBet.value, lastBet.result);
        }
    }

    function makeProvableQuery() virtual internal returns(bytes32){
        uint256 GAS_FOR_CALLBACK = 7600000;
        uint provablePrice = provable_getPrice("random", GAS_FOR_CALLBACK);
        if (provablePrice > balance) {
            emit newProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee: ");
            revert();
        }
        uint256 QUERY_EXECUTION_DELAY = 0;
        
        bytes32 queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );
        return queryId;
    }

    function deposit() public payable costs(1 ether) {
        playerBalance[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, playerBalance[msg.sender]);
    }

    function toggleProcesingAddresses(address player) public onlyOwner {
        if (procesingAddresses[player] == true) {
            procesingAddresses[player] = false;
        } else {
            procesingAddresses[player] = true;
        }
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

    function getRandom(string memory _result) virtual internal view returns(uint){
        return uint(keccak256(abi.encodePacked(_result))) % 2; 
    }

    function isProvableAddress() virtual public payable returns(bool){
        if (msg.sender == provable_cbAddress()) {
            return true;
        }
        return false;
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
