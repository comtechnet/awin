// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { IawinAuctionHouse } from '../interfaces/IawinAuctionHouse.sol';

contract MaliciousBidder {
    function bid(IawinAuctionHouse auctionHouse, uint256 tokenId) public payable {
        auctionHouse.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
