// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice An immutable registry for claim and fraud-prediction integrity hashes.
/// No claim, patient, policy, or prediction contents are stored on-chain.
contract InsuranceFraudRegistry {
    struct HashRecord {
        bytes32 hash;
        uint256 timestamp;
        address submitter;
        bool exists;
    }

    address public authorizedWriter;
    mapping(uint256 => HashRecord) private claimRecords;
    mapping(uint256 => HashRecord) private predictionRecords;

    event ClaimHashStored(uint256 indexed claimId, bytes32 indexed claimHash, uint256 timestamp, address indexed submitter);
    event PredictionHashStored(uint256 indexed predictionId, bytes32 indexed predictionHash, uint256 timestamp, address indexed submitter);
    event AuthorizedWriterUpdated(address indexed previousWriter, address indexed newWriter);

    constructor() {
        authorizedWriter = msg.sender;
    }

    modifier onlyAuthorizedWriter() {
        require(msg.sender == authorizedWriter, "Unauthorized writer");
        _;
    }

    function setAuthorizedWriter(address newWriter) external onlyAuthorizedWriter {
        require(newWriter != address(0), "Invalid writer address");
        address previousWriter = authorizedWriter;
        authorizedWriter = newWriter;
        emit AuthorizedWriterUpdated(previousWriter, newWriter);
    }

    function storeClaimHash(uint256 claimId, bytes32 claimHash) external onlyAuthorizedWriter {
        require(claimHash != bytes32(0), "Claim hash cannot be empty");
        require(!claimRecords[claimId].exists, "Claim already registered");
        claimRecords[claimId] = HashRecord(claimHash, block.timestamp, msg.sender, true);
        emit ClaimHashStored(claimId, claimHash, block.timestamp, msg.sender);
    }

    function storePredictionHash(uint256 predictionId, bytes32 predictionHash) external onlyAuthorizedWriter {
        require(predictionHash != bytes32(0), "Prediction hash cannot be empty");
        require(!predictionRecords[predictionId].exists, "Prediction already registered");
        predictionRecords[predictionId] = HashRecord(predictionHash, block.timestamp, msg.sender, true);
        emit PredictionHashStored(predictionId, predictionHash, block.timestamp, msg.sender);
    }

    function getClaimHash(uint256 claimId) external view returns (bytes32) {
        return claimRecords[claimId].hash;
    }

    function getPredictionHash(uint256 predictionId) external view returns (bytes32) {
        return predictionRecords[predictionId].hash;
    }

    function getClaimRecord(uint256 claimId) external view returns (bytes32 hash, uint256 timestamp, address submitter, bool exists) {
        HashRecord memory record = claimRecords[claimId];
        return (record.hash, record.timestamp, record.submitter, record.exists);
    }

    function getPredictionRecord(uint256 predictionId) external view returns (bytes32 hash, uint256 timestamp, address submitter, bool exists) {
        HashRecord memory record = predictionRecords[predictionId];
        return (record.hash, record.timestamp, record.submitter, record.exists);
    }

    function verifyClaimHash(uint256 claimId, bytes32 claimHash) external view returns (bool) {
        return claimRecords[claimId].exists && claimRecords[claimId].hash == claimHash;
    }

    function verifyPredictionHash(uint256 predictionId, bytes32 predictionHash) external view returns (bool) {
        return predictionRecords[predictionId].exists && predictionRecords[predictionId].hash == predictionHash;
    }
}
