const CoinFlip = artifacts.require("CoinFlip");
const MockedCoinFlip = artifacts.require("MockedCoinFlip");
const truffleAssert = require("truffle-assertions");
const { before } = require("lodash");


contract("CoinFlip", async function (accounts) {
    let instance;

    describe('deposit and withdraw', async () => {
        let realBalanceBefore;
        let realBalanceAfter;

        beforeEach(async function () {
            instance = await CoinFlip.new({ value: web3.utils.toWei("10", "ether") });
            realBalanceBefore = await web3.eth.getBalance(accounts[0]);
            await instance.deposit({ value: web3.utils.toWei("1", "ether") });
            realBalanceAfter = await web3.eth.getBalance(accounts[0]);
        });

        it("should be able to deposit funds to contract", async function () {
            let playerBalance = await instance.playerBalance(accounts[0]);
            let contractBalance = await web3.eth.getBalance(instance.address);
            assert(contractBalance = web3.utils.toWei("11", "ether"));
            assert(playerBalance == web3.utils.toWei("1", "ether"));
            assert(realBalanceAfter < realBalanceBefore);
        });

        it("should be able to withdraw user balance from contract", async function () {
            await instance.withdraw({ 'from': accounts[0] });
            let playerBalance = await instance.playerBalance(accounts[0]);
            let contractBalance = await web3.eth.getBalance(instance.address);
            realBalanceAfterWithdraw = await web3.eth.getBalance(accounts[0]);
            assert(realBalanceAfterWithdraw > realBalanceAfter);
            assert(playerBalance == 0);
            assert(contractBalance = web3.utils.toWei("10", "ether"));
        });
        it("doposit should fail wrong ether send", async function () {
            await truffleAssert.fails(instance.deposit({ value: web3.utils.toWei("0.1", "ether") }), truffleAssert.ErrorType.REVERT);
        });
        it("withdraw should fail if user balance is 0", async function () {
            await instance.withdraw({ 'from': accounts[0] });
            await truffleAssert.fails(instance.withdraw({ 'from': accounts[0] }));
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
                await instance.deposit({ value: web3.utils.toWei("2", "ether") });
                await instance._mock_setfakeRandomValue(randomValue);
                playerBalanceBefore = parseFloat(await instance.playerBalance(accounts[0]));
                balanceBefore = await instance.balance();
                result = await instance.bet(bettingSide, web3.utils.toWei("2", "ether"));
                playerBalanceAfter = parseFloat(await instance.playerBalance(accounts[0]));
            });
            it("player balance should be grater after win", async function () {
                assert(playerBalanceAfter > playerBalanceBefore, "User balance was not increased after win");
            });
            it("player balance should not be increased after second win when contract balance was 0", async function () {
                playerBalanceBefore = parseFloat(await instance.playerBalance(accounts[0]));
                await truffleAssert.fails(instance.bet(bettingSide, { value: web3.utils.toWei("2", "ether") }));
                playerBalanceAfter = parseFloat(await instance.playerBalance(accounts[0]));
                assert(playerBalanceAfter == playerBalanceBefore, "User balance was increased after win when contract balance was 0");
            });
            it("contract balance should be empty after player win and player wins all", async function () {
                let balance = await instance.balance();
                let floatBalance = parseFloat(balance);
                let realBalance = await web3.eth.getBalance(instance.address);
                assert(floatBalance == web3.utils.toWei("0", "ether"), "Contract balance did not match");
            });
            it('emits a betWin event', async () => {
                const log = result.logs[0]
                assert(log.event == 'betWin');
            });
        });

        describe('test lose case', async () => {
            let result;

            beforeEach(async function () {
                randomValue = 0;
                bettingSide = 1;
                instance = await MockedCoinFlip.new({ value: web3.utils.toWei("4", "ether") });
                await instance.deposit({ value: web3.utils.toWei("2", "ether") });
                await instance._mock_setfakeRandomValue(randomValue);
                playerBalanceBefore = parseFloat(await instance.playerBalance(accounts[0]));
                balanceBefore = await instance.balance();
                result = await instance.bet(bettingSide, web3.utils.toWei("2", "ether"));
                playerBalanceAfter = parseFloat(await instance.playerBalance(accounts[0]));
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
                assert(log.event == 'betLost');
            });
    
        })

    });

    
    
    


});