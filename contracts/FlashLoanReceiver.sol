// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.0;

import "./FlashLoan.sol";
import "./Token.sol";

contract FlashLoanReceiver {
    FlashLoan private pool;
    address private owner;

    event LoanReceived(address token, uint256 amont);

    constructor(address _poolAddress) {
        pool = FlashLoan(_poolAddress);
        owner = msg.sender;
    }

    function receiveTokens(address _tokenAddress, uint256 _amount) external {
        require(msg.sender == address(pool), "Sender must be pool");
        require(Token(_tokenAddress).balanceOf(address(this)) == _amount, "failed to get loan");
        emit LoanReceived(_tokenAddress, _amount);

        require(Token(_tokenAddress).transfer(msg.sender, _amount), "Transfer of tokens failed");
    }

    function executeFlashLoan(uint _amount) external onlyOwner {
        pool.flashLoan(_amount);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}
