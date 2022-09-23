// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address private owner;
    address[] public players;

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function enter() public payable {
        require(msg.value == .001 ether, "Value should be .001 ether");

        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public isOwner {
        uint winnerIndex = random() % players.length;

        uint contractBalance = address(this).balance;

        payable(players[winnerIndex]).transfer(contractBalance);

        players = new address[](0);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }
}
