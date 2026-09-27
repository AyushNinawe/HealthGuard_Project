const db = require("../config/db");
const { createAuditLog } = require("./auditController");
const {
    generateClaimHash,
    generatePredictionHash,
    storeClaimHash: storeClaimHashService,
    storePredictionHash: storePredictionHashService,
    getClaimHash,
    getPredictionHash,
    verifyClaimHash,
    verifyPredictionHash,
    getClaimRecord,
    getPredictionRecord
} = require("../services/blockchainService.js");

const validId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const mapError = (error, res) => res.status({ BLOCKCHAIN_UNAVAILABLE: 503, CONTRACT_NOT_DEPLOYED: 503, ABI_NOT_FOUND: 503, SIGNER_NOT_CONFIGURED: 503, INVALID_HASH: 400, DUPLICATE_OR_REVERTED: 409, TRANSACTION_FAILED: 502 }[error.code] || 500).json({ success: false, error: error.code || "BLOCKCHAIN_ERROR", message: error.message });
async function claim(claimId) { const [rows] = await db.query("SELECT * FROM claims WHERE claim_id = ?", [claimId]); return rows[0] || null; }
async function prediction(predictionId) { const [rows] = await db.query("SELECT prediction_id, claim_id, prediction, fraud_score, risk_level, confidence FROM fraud_predictions WHERE prediction_id = ?", [predictionId]); return rows[0] || null; }
async function audit(userId, claimId, action, description) { await createAuditLog({ userId, claimId, action, description }); }

const storeClaimHash = async (req, res) => {
    const claimId = Number(req.params.claimId);
    if (!validId(claimId)) return res.status(400).json({ success: false, message: "Invalid claim ID." });
    try {
        const row = await claim(claimId);
        if (!row) return res.status(404).json({ success: false, message: "Claim not found." });
        const claimHash = generateClaimHash(row);
        const transaction = await storeClaimHashService(claimId, claimHash);
        await audit(req.user.user_id, claimId, "CLAIM_HASH_STORED", `Claim integrity hash stored. Tx: ${transaction.transactionHash}`);
        return res.status(201).json({ success: true, claim_id: claimId, claim_hash: claimHash, transaction_hash: transaction.transactionHash, block_number: transaction.blockNumber, contract_address: transaction.contractAddress });
    } catch (error) { return mapError(error, res); }
};

const storePredictionHash = async (req, res) => {
    const predictionId = Number(req.params.predictionId);
    if (!validId(predictionId)) return res.status(400).json({ success: false, message: "Invalid prediction ID." });
    try {
        const row = await prediction(predictionId);
        if (!row) return res.status(404).json({ success: false, message: "Prediction not found." });
        const predictionHash = generatePredictionHash(row);
        const transaction = await storePredictionHashService(predictionId, predictionHash);
        await audit(req.user.user_id, row.claim_id, "PREDICTION_HASH_STORED", `Prediction integrity hash stored. Tx: ${transaction.transactionHash}`);
        return res.status(201).json({ success: true, prediction_id: predictionId, prediction_hash: predictionHash, transaction_hash: transaction.transactionHash, block_number: transaction.blockNumber, contract_address: transaction.contractAddress });
    } catch (error) { return mapError(error, res); }
};

const verifyClaim = async (req, res) => {
    const claimId = Number(req.params.claimId);
    if (!validId(claimId)) return res.status(400).json({ success: false, message: "Invalid claim ID." });
    try {
        const row = await claim(claimId);
        if (!row) return res.status(404).json({ success: false, message: "Claim not found." });
        const databaseHash = generateClaimHash(row);
        const blockchainHash = await getClaimHash(claimId);
        const verified = blockchainHash !== "0x".padEnd(66, "0") && await verifyClaimHash(claimId, databaseHash);
        await audit(req.user.user_id, claimId, "CLAIM_BLOCKCHAIN_VERIFIED", `Claim blockchain verification: ${verified ? "valid" : "invalid"}.`);
        return res.json({ success: true, claim_id: claimId, verified, database_hash: databaseHash, blockchain_hash: blockchainHash, message: blockchainHash === "0x".padEnd(66, "0") ? "No blockchain claim record found." : verified ? "Claim data matches blockchain record." : "Claim data has changed since blockchain registration." });
    } catch (error) { return mapError(error, res); }
};

const verifyPrediction = async (req, res) => {
    const predictionId = Number(req.params.predictionId);
    if (!validId(predictionId)) return res.status(400).json({ success: false, message: "Invalid prediction ID." });
    try {
        const row = await prediction(predictionId);
        if (!row) return res.status(404).json({ success: false, message: "Prediction not found." });
        const databaseHash = generatePredictionHash(row);
        const blockchainHash = await getPredictionHash(predictionId);
        const verified = blockchainHash !== "0x".padEnd(66, "0") && await verifyPredictionHash(predictionId, databaseHash);
        await audit(req.user.user_id, row.claim_id, "PREDICTION_BLOCKCHAIN_VERIFIED", `Prediction blockchain verification: ${verified ? "valid" : "invalid"}.`);
        return res.json({ success: true, prediction_id: predictionId, verified, database_hash: databaseHash, blockchain_hash: blockchainHash, message: blockchainHash === "0x".padEnd(66, "0") ? "No blockchain prediction record found." : verified ? "Prediction data matches blockchain record." : "Prediction data has changed since blockchain registration." });
    } catch (error) { return mapError(error, res); }
};

const getClaim = async (req, res) => {
    const id = Number(req.params.claimId);
    if (!validId(id)) return res.status(400).json({ success: false, message: "Invalid claim ID." });
    try {
        const record = await getClaimRecord(id);
        return record.exists ? res.json({ success: true, claim_id: id, blockchain_record: record }) : res.status(404).json({ success: false, message: "No blockchain claim record found." });
    } catch (error) { return mapError(error, res); }
};

const getPrediction = async (req, res) => {
    const id = Number(req.params.predictionId);
    if (!validId(id)) return res.status(400).json({ success: false, message: "Invalid prediction ID." });
    try {
        const record = await getPredictionRecord(id);
        return record.exists ? res.json({ success: true, prediction_id: id, blockchain_record: record }) : res.status(404).json({ success: false, message: "No blockchain prediction record found." });
    } catch (error) { return mapError(error, res); }
};

module.exports = { storeClaimHash, storePredictionHash, verifyClaim, verifyPrediction, getClaim, getPrediction };
