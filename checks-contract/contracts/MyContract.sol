// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    uint256 public number;

    function setNumber(uint256 _num) public {
        number = _num;
    }

    function getNumber() public view returns (uint256) {
        return number;
    }
}
