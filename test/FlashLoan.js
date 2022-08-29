const { expect } = require("chai");
const { ethers } = require("hardhat")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const ether = tokens;

describe("Flash Loan", () => {
    let token, flashLoan, flashLoanReceiver;

    beforeEach(async () => {

        accounts  =  await ethers.getSigners();
        deployer = accounts[0];

        const tokenName =  "W3D FlashLoan"
        const tokenSymbol = "W3FL";
        const tokenAmount = 1000000;

        const FlashLoan = await ethers.getContractFactory("FlashLoan");
        const FlashLoanReceiver = await ethers.getContractFactory("FlashLoanReceiver");
        const Token = await ethers.getContractFactory("Token");

        token = await Token.deploy(tokenName, tokenSymbol, tokenAmount);
        let flashLoan = await FlashLoan.deploy(token.address);

        transaction = await token.connect(deployer).approve(flashLoan.address, ether(tokenAmount));
        await transaction.wait();

        transaction = await flashLoan.connect(deployer).depositTokens(ether(tokenAmount));
        await transaction.wait();

        flashLoanReceiver = await FlashLoanReceiver.deploy(flashLoan.address);

    });

    describe("Deployment", () => {
        it("works", () => {
            expect(1+1).to.equal(2);
        })
    });

    describe("Borrowing funds", () => {
        it("borrows funds from the pool", async () => {
            let amount = ether(100)
            let transaction = await flashLoanReceiver.connect(deployer).executeFlashLoan(amount);
            let result = await transaction.wait();

            await expect(transaction).to.emit(flashLoanReceiver, "LoanReceived")
            .withArgs(token.address, amount);
        })
    })
})