//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DudiStorage {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    function ethWithdraw(uint _amount) external {
        require(msg.sender == owner, "You don't have permission to withdraw.");
        require(address(this).balance >= 0.5 ether, "You must HODL until you have at least 0.5 ETH.");
        payable(msg.sender).transfer(_amount);
    }

    function ercWithdraw(IERC20 token, address to, uint256 amount) public {
        require(msg.sender == owner, "You don't have permission to withdraw.");
        uint256 ercBalance = token.balanceOf(address(this));
        require(ercBalance >= 10 ether, "You must HODL until you have at least 10 tokens.");
        require(amount <= ercBalance, "You're trying to withdraw more tokens than there are available.");
        token.transfer(to, amount);
    }

    function getEthBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getErcBalance(IERC20 token) external view returns (uint) {
        return token.balanceOf(address(this));
    }
}