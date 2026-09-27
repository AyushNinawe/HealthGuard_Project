-- Local development schema reconstructed from the existing backend queries.
CREATE DATABASE IF NOT EXISTS insurance_fraud_detection;
USE insurance_fraud_detection;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    policy_id INT NOT NULL,
    claim_amount DECIMAL(12,2) NOT NULL,
    claim_type VARCHAR(100) NULL,
    hospital_name VARCHAR(255) NULL,
    vehicle_number VARCHAR(100) NULL,
    vehicle_age INT NULL,
    police_report TINYINT(1) NOT NULL DEFAULT 0,
    incident_date DATE NULL,
    incident_location VARCHAR(255) NULL,
    description TEXT NULL,
    claim_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_claims_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fraud_predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    prediction VARCHAR(100) NOT NULL,
    fraud_score DECIMAL(8,6) NULL,
    risk_level VARCHAR(50) NULL,
    confidence DECIMAL(8,6) NULL,
    model_version VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_predictions_claim FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL DEFAULT 'other',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_claim FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    claim_id INT NULL,
    action VARCHAR(100) NOT NULL,
    old_status VARCHAR(100) NULL,
    new_status VARCHAR(100) NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_claim FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
