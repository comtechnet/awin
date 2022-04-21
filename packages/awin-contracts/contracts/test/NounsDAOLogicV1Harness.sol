// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import '../governance/awinDAOLogicV1.sol';

contract awinDAOLogicV1Harness is awinDAOLogicV1 {
    function initialize(
        address timelock_,
        address awin_,
        address vetoer_,
        uint256 votingPeriod_,
        uint256 votingDelay_,
        uint256 proposalThresholdBPS_,
        uint256 quorumVotesBPS_
    ) public override {
        require(msg.sender == admin, 'awinDAO::initialize: admin only');
        require(address(timelock) == address(0), 'awinDAO::initialize: can only initialize once');

        timelock = IawinDAOExecutor(timelock_);
        awin = awinTokenLike(awin_);
        vetoer = vetoer_;
        votingPeriod = votingPeriod_;
        votingDelay = votingDelay_;
        proposalThresholdBPS = proposalThresholdBPS_;
        quorumVotesBPS = quorumVotesBPS_;
    }
}
