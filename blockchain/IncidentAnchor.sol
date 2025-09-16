// blockchain/IncidentAnchor.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IncidentAnchor {
    event Anchored(bytes32 indexed incidentId, bytes32 dataHash, address indexed attestor, uint256 timestamp);
    mapping(bytes32 => bytes32) public anchors; // incidentId => dataHash

    function anchor(bytes32 incidentId, bytes32 dataHash) external {
        require(anchors[incidentId] == bytes32(0), "Already anchored");
        anchors[incidentId] = dataHash;
        emit Anchored(incidentId, dataHash, msg.sender, block.timestamp);
    }

    function get(bytes32 incidentId) external view returns (bytes32) {
        return anchors[incidentId];
    }
}