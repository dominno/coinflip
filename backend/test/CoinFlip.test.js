const CoinFlip = artifacts.require("CoinFlip");
const MockedCoinFlip = artifacts.require("MockedCoinFlip");
const truffleAssert = require("truffle-assertions");
const { before } = require("lodash");


contract("CoinFlip", async function ([owner, player]) {
    let instance;

    describe('deposit and withdraw', async () => {
        let realBalanceBefore;
        let realBalanceAfter;

        beforeEach(async function () {
            instance = await CoinFlip.new({ value: web3.utils.toWei("10", "ether") });
            realBalanceBefore = await web3.eth.getBalance(player);
            await instance.deposit({ value: web3.utils.toWei("1", "ether"), from: player });
            realBalanceAfter = await web3.eth.getBalance(player);
        });

        it("should be able to deposit funds to contract", async function () {
            let playerBalance = await instance.playerBalance(player);
            let contractBalance = await web3.eth.getBalance(instance.address);
            assert(contractBalance = web3.utils.toWei("11", "ether"));
            assert(playerBalance == web3.utils.toWei("1", "ether"));
            assert(realBalanceAfter < realBalanceBefore);
        });

        it("should be able to withdraw user balance from contract", async function () {
            await instance.withdraw(web3.utils.toWei("1", "ether"), { 'from': player });
            let playerBalance = await instance.playerBalance(player);
            let contractBalance = await web3.eth.getBalance(instance.address);
            realBalanceAfterWithdraw = await web3.eth.getBalance(player);
            assert(realBalanceAfterWithdraw > realBalanceAfter);
            assert(playerBalance == 0);
            assert(contractBalance = web3.utils.toWei("10", "ether"));
        });
        it("doposit should fail wrong ether send", async function () {
            await truffleAssert.fails(instance.deposit({ value: web3.utils.toWei("0.1", "ether"), from: player }), truffleAssert.ErrorType.REVERT);
        });
        it("withdraw should fail if user balance is 0", async function () {            
            await instance.withdraw(web3.utils.toWei("1", "ether"), { 'from': player });
            await truffleAssert.fails(instance.withdraw(web3.utils.toWei("1", "ether"), { 'from': player }));
        });
        it("should be able to withdraw all user balance", async function () {   
            await instance.deposit({ value: web3.utils.toWei("1", "ether"), from: player });
            let playerBalance = await instance.playerBalance(player);    
            await instance.withdraw(playerBalance, { 'from': player });
            let playerBalanceAfter = await instance.playerBalance(player);
            assert(playerBalanceAfter == 0);        
        });


    });

    describe('check requre assertions', async () => {
        beforeEach(async function () {
            instance = await CoinFlip.new({ value: web3.utils.toWei("10", "ether") })
            await instance.deposit({ value: web3.utils.toWei("1", "ether") });
        });
        it("bet other then head or tail should fail", async function () {
            await truffleAssert.fails(instance.bet(2, web3.utils.toWei("1", "ether")), truffleAssert.ErrorType.REVERT);
        });
        it("contract balance bellow sent value should fail", async function () {            
            await truffleAssert.fails(instance.bet(0, web3.utils.toWei("20", "ether")), truffleAssert.ErrorType.REVERT);
        });
        it("bet should fail when user balance is bellow value", async function () {            
            await truffleAssert.fails(instance.bet(0, web3.utils.toWei("2", "ether")), truffleAssert.ErrorType.REVERT);
        });
    });

    describe('test owner deposit or withdraw from contract', async () => {
        beforeEach(async function () {
            instance = await CoinFlip.new({ value: web3.utils.toWei("10", "ether") })            
        });
        it("owner should be able to fund contract", async function () {
            await instance.depositToContract({ value: web3.utils.toWei("1", "ether"), from: owner });
            let contractBalance = await web3.eth.getBalance(instance.address);
            let balance = await instance.balance();
            assert(contractBalance == web3.utils.toWei("11", "ether"));
            assert(balance == web3.utils.toWei("11", "ether"));
        });
        it("owner should be able to withdraw from contract", async function () {
            await instance.withdrawFromContract({ from: owner  });
            let contractBalance = await web3.eth.getBalance(instance.address);
            let balance = await instance.balance();
            assert(contractBalance == 0);
            assert(balance == 0);
        });
        it("player should not be able to withdraw from contract", async function () {
            await truffleAssert.fails(instance.withdrawFromContract({ from: player  }));
            let contractBalance = await web3.eth.getBalance(instance.address);
            let balance = await instance.balance();
            assert(contractBalance > 0);
            assert(balance > 0);
        });
        it("player should not be able to deposit to contract", async function () {
            await truffleAssert.fails(instance.depositToContract({ value: web3.utils.toWei("1", "ether"), from: player }));            
        });

    });

    describe('test win and lose cases', async () => {
        let randomValue;
        let bettingSide;
        let playerBalanceBefore;
        let playerBalanceAfter;
        let balanceBefore;

        describe('test win case', async () => {
            let result;
            beforeEach(async function () {
                randomValue = 0;
                bettingSide = 0;
                instance = await MockedCoinFlip.new({ value: web3.utils.toWei("2", "ether") });
                await instance.deposit({ value: web3.utils.toWei("2", "ether"), from: player });
                await instance._mock_setfakeRandomValue(randomValue);
                playerBalanceBefore = parseFloat(await instance.playerBalance(player));
                balanceBefore = await instance.balance();
                await instance.bet(bettingSide, web3.utils.toWei("2", "ether"), {from: player});
                result = await instance.__callback("0x7465737400000000000000000000000000000000000000000000000000000000", "0", "00000");
                playerBalanceAfter = parseFloat(await instance.playerBalance(player));
            });
            it("after callback procesingAddresses for have to be set to false", async function () {
                assert(await instance.procesingAddresses(player) == false);
            });
            it("player balance should be grater after win", async function () {
                assert(playerBalanceAfter > playerBalanceBefore, "User balance was not increased after win");
            });
            it("player balance should not be increased after second win when contract balance was 0", async function () {
                playerBalanceBefore = parseFloat(await instance.playerBalance(player));
                await truffleAssert.fails(instance.bet(bettingSide, web3.utils.toWei("2", "ether"), {from: player}));
                playerBalanceAfter = parseFloat(await instance.playerBalance(player));
                assert(playerBalanceAfter == playerBalanceBefore, "User balance was increased after win when contract balance was 0");
            });
            it("contract balance should be empty after player win and player wins all", async function () {
                let balance = await instance.balance();
                let floatBalance = parseFloat(balance);
                let realBalance = await web3.eth.getBalance(instance.address);
                assert(floatBalance == web3.utils.toWei("0", "ether"), "Contract balance did not match");
            });
            it('emits a win event', async () => {
                const log = result.logs[0]
                assert(log.event == 'betFinished');
                assert(log.args.win == true);
                
            });
        });

        describe('test lose case', async () => {
            let result;
            beforeEach(async function () {
                randomValue = 0;
                bettingSide = 1;
                instance = await MockedCoinFlip.new({ value: web3.utils.toWei("4", "ether") });
                await instance.deposit({ value: web3.utils.toWei("2", "ether"), from: player });
                await instance._mock_setfakeRandomValue(randomValue);
                playerBalanceBefore = parseFloat(await instance.playerBalance(player));
                balanceBefore = await instance.balance();
                await instance.bet(bettingSide, web3.utils.toWei("2", "ether"), {from: player});
                result = await instance.__callback("0x7465737400000000000000000000000000000000000000000000000000000000", "1", "00000");
                playerBalanceAfter = parseFloat(await instance.playerBalance(player));
            });
            it("player balance should be lower after lose", async function () {
                assert(playerBalanceAfter < playerBalanceBefore, "User balance was not decreased after lose");
            });
            it("contract balance should be greater after player lose", async function () {
                let balance = await instance.balance();
                let floatBalance = parseFloat(balance);
                assert(floatBalance > parseFloat(balanceBefore), "Contract balance was not incrased after player lose");
            });
            it('emits a betLost event', async () => {
                const log = result.logs[0]
                assert(log.event == 'betFinished');
                assert(log.args.win == false);
            });
        })
    });
});