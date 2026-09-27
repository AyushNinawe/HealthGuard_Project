-- Blockchain transaction metadata for tamper-evident claim/prediction hashes
-- Run: mysql -u root -p insurance_fraud_detection < migrations/001_create_blockchain_records.sql

CREATE TABLE IF NOT EXISTS blockchain_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    claim_hash VARCHAR(66) NULL,
    prediction_hash VARCHAR(66) NULL,
    claim_transaction_hash VARCHAR(66) NULL,
    prediction_transaction_hash VARCHAR(66) NULL,
    blockchain_network VARCHAR(50) NOT NULL DEFAULT 'localhost',
    contract_address VARCHAR(42) NOT NULL,
    claim_block_number INT NULL,
    prediction_block_number INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_blockchain_records_claim_id (claim_id),
    CONSTRAINT fk_blockchain_records_claim
        FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
