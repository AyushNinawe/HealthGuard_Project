/**
 * blockchainRecordService.cjs
 *
 * MySQL persistence for blockchain transaction metadata.
 */
const db = require("../config/db");

async function getByClaimId(claimId) {
    const [rows] = await db.query(
        `SELECT *
         FROM blockchain_records
         WHERE claim_id = ?
         LIMIT 1`,
        [claimId]
    );

    return rows.length > 0 ? rows[0] : null;
}

async function upsertClaimRecord({
    claimId,
    claimHash,
    claimTransactionHash,
    claimBlockNumber,
    contractAddress,
    blockchainNetwork,
}) {
    const existing = await getByClaimId(claimId);

    if (existing) {
        await db.query(
            `UPDATE blockchain_records
             SET
                claim_hash = ?,
                claim_transaction_hash = ?,
                claim_block_number = ?,
                contract_address = ?,
                blockchain_network = ?,
                updated_at = CURRENT_TIMESTAMP
             WHERE claim_id = ?`,
            [
                claimHash,
                claimTransactionHash,
                claimBlockNumber,
                contractAddress,
                blockchainNetwork,
                claimId,
            ]
        );

        return getByClaimId(claimId);
    }

    await db.query(
        `INSERT INTO blockchain_records
        (
            claim_id,
            claim_hash,
            claim_transaction_hash,
            claim_block_number,
            contract_address,
            blockchain_network
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            claimId,
            claimHash,
            claimTransactionHash,
            claimBlockNumber,
            contractAddress,
            blockchainNetwork,
        ]
    );

    return getByClaimId(claimId);
}

async function upsertPredictionRecord({
    claimId,
    predictionHash,
    predictionTransactionHash,
    predictionBlockNumber,
    contractAddress,
    blockchainNetwork,
}) {
    const existing = await getByClaimId(claimId);

    if (!existing) {
        await db.query(
            `INSERT INTO blockchain_records
            (
                claim_id,
                prediction_hash,
                prediction_transaction_hash,
                prediction_block_number,
                contract_address,
                blockchain_network
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                claimId,
                predictionHash,
                predictionTransactionHash,
                predictionBlockNumber,
                contractAddress,
                blockchainNetwork,
            ]
        );

        return getByClaimId(claimId);
    }

    await db.query(
        `UPDATE blockchain_records
         SET
            prediction_hash = ?,
            prediction_transaction_hash = ?,
            prediction_block_number = ?,
            contract_address = COALESCE(contract_address, ?),
            blockchain_network = COALESCE(blockchain_network, ?),
            updated_at = CURRENT_TIMESTAMP
         WHERE claim_id = ?`,
        [
            predictionHash,
            predictionTransactionHash,
            predictionBlockNumber,
            contractAddress,
            blockchainNetwork,
            claimId,
        ]
    );

    return getByClaimId(claimId);
}

module.exports = {
    getByClaimId,
    upsertClaimRecord,
    upsertPredictionRecord,
};
