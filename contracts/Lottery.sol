// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address private owner;
    address payable[] public players;

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function enter() public payable {
        require(msg.value == .001 ether, "Value should be .001 ether");

        players.push(payable(msg.sender));
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public isOwner {
        uint winnerIndex = random() % players.length;

        uint contractBalance = address(this).balance;

        players[winnerIndex].transfer(contractBalance);

        players = new address payable[](0);
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}
