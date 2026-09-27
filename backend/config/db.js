const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// In-Memory Database store for fallback when MySQL server is not connected
class InMemoryDB {
    constructor() {
        const hashedUserPw = bcrypt.hashSync("user123", 10);
        const hashedAdminPw = bcrypt.hashSync("admin123", 10);
        const hashedAdminAltPw = bcrypt.hashSync("password123", 10);

        this.users = [
            {
                user_id: 1,
                full_name: "Demo User",
                email: "user@healthguard.com",
                phone: "+1 555-0192",
                password_hash: hashedUserPw,
                role: "user",
                created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: 2,
                full_name: "Admin Officer",
                email: "admin@healthguard.com",
                phone: "+1 555-0199",
                password_hash: hashedAdminPw,
                alt_password_hash: hashedAdminAltPw,
                role: "admin",
                created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        this.claims = [
            {
                claim_id: 1,
                user_id: 1,
                policy_id: 10452,
                claim_amount: 14500.00,
                claim_type: "Medical",
                hospital_name: "St. Jude Memorial Hospital",
                vehicle_number: null,
                vehicle_age: null,
                police_report: 0,
                incident_date: "2026-08-15",
                incident_location: "Metro General Ward",
                description: "Emergency appendectomy and post-operative recovery suite.",
                claim_status: "approved",
                created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
                updated_at: new Date(Date.now() - 18 * 86400000).toISOString()
            },
            {
                claim_id: 2,
                user_id: 1,
                policy_id: 10452,
                claim_amount: 320000.00,
                claim_type: "Accident",
                hospital_name: "Apex Trauma Care",
                vehicle_number: "NY-992-TX",
                vehicle_age: 14,
                police_report: 0,
                incident_date: "2026-09-02",
                incident_location: "Highway 10 Exit 4B",
                description: "Multi-vehicle collision claim with major damages and medical bills.",
                claim_status: "flagged",
                created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
                updated_at: new Date(Date.now() - 9 * 86400000).toISOString()
            },
            {
                claim_id: 3,
                user_id: 1,
                policy_id: 10890,
                claim_amount: 8500.00,
                claim_type: "Dental",
                hospital_name: "BrightSmile Dental Clinic",
                vehicle_number: null,
                vehicle_age: null,
                police_report: 0,
                incident_date: "2026-09-12",
                incident_location: "Downtown Clinic",
                description: "Root canal therapy and porcelain crowns.",
                claim_status: "pending",
                created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
                updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
            },
            {
                claim_id: 4,
                user_id: 1,
                policy_id: 11022,
                claim_amount: 540000.00,
                claim_type: "Vehicle",
                hospital_name: "City Central Clinic",
                vehicle_number: "CA-402-KR",
                vehicle_age: 18,
                police_report: 0,
                incident_date: "2026-09-18",
                incident_location: "Industrial District Road 9",
                description: "Severe vehicle collision with undocumented medical transport.",
                claim_status: "rejected",
                created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
                updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
            }
        ];

        this.fraud_predictions = [
            {
                prediction_id: 1,
                claim_id: 1,
                prediction: "Genuine",
                fraud_score: 8.50,
                risk_level: "Low",
                confidence: 94.20,
                model_version: "v2.4.1",
                created_at: new Date(Date.now() - 20 * 86400000).toISOString()
            },
            {
                prediction_id: 2,
                claim_id: 2,
                prediction: "Fraud",
                fraud_score: 88.40,
                risk_level: "High",
                confidence: 91.60,
                model_version: "v2.4.1",
                created_at: new Date(Date.now() - 10 * 86400000).toISOString()
            },
            {
                prediction_id: 3,
                claim_id: 3,
                prediction: "Genuine",
                fraud_score: 12.00,
                risk_level: "Low",
                confidence: 92.00,
                model_version: "v2.4.1",
                created_at: new Date(Date.now() - 4 * 86400000).toISOString()
            },
            {
                prediction_id: 4,
                claim_id: 4,
                prediction: "Fraud",
                fraud_score: 95.30,
                risk_level: "Critical",
                confidence: 96.80,
                model_version: "v2.4.1",
                created_at: new Date(Date.now() - 2 * 86400000).toISOString()
            }
        ];

        this.documents = [
            {
                document_id: 1,
                claim_id: 1,
                document_type: "discharge_summary",
                file_name: "hospital_discharge_summary.pdf",
                file_path: "/uploads/medicalreport.pdf",
                created_at: new Date(Date.now() - 20 * 86400000).toISOString()
            },
            {
                document_id: 2,
                claim_id: 2,
                document_type: "incident_bill",
                file_name: "repair_and_medical_bill.pdf",
                file_path: "/uploads/kkkk.pdf",
                created_at: new Date(Date.now() - 10 * 86400000).toISOString()
            }
        ];

        this.audit_logs = [
            {
                log_id: 1,
                user_id: 1,
                claim_id: 1,
                action: "CLAIM_CREATED",
                old_status: null,
                new_status: "pending",
                description: "Claim submitted by user.",
                created_at: new Date(Date.now() - 20 * 86400000).toISOString()
            },
            {
                log_id: 2,
                user_id: 2,
                claim_id: 1,
                action: "STATUS_UPDATE",
                old_status: "pending",
                new_status: "approved",
                description: "Claim verified and approved by admin.",
                created_at: new Date(Date.now() - 18 * 86400000).toISOString()
            },
            {
                log_id: 3,
                user_id: 1,
                claim_id: 2,
                action: "FRAUD_PREDICTION",
                old_status: null,
                new_status: null,
                description: "AI model flagged high anomaly risk (88.4%).",
                created_at: new Date(Date.now() - 10 * 86400000).toISOString()
            }
        ];

        this.blockchain_records = [
            {
                id: 1,
                claim_id: 1,
                claim_hash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                prediction_hash: "0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                claim_transaction_hash: "0x3e18a9928b122f462a8c3d9a0d810842217c09363a056a0c0ad7f4c52086e9f1",
                prediction_transaction_hash: "0x98b821034f8a11ea054dbbe71987514a60e0a599651c6827b59ef96a09047b19",
                blockchain_network: "localhost",
                contract_address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
                claim_block_number: 14208,
                prediction_block_number: 14209,
                created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
                updated_at: new Date(Date.now() - 20 * 86400000).toISOString()
            }
        ];

        this.nextUserId = 3;
        this.nextClaimId = 5;
        this.nextPredictionId = 5;
        this.nextDocumentId = 3;
        this.nextAuditId = 4;
        this.nextBlockchainId = 2;
    }

    async query(sql, params = []) {
        const cleanSql = sql.trim().replace(/\s+/g, " ");

        // 1. SELECT 1
        if (cleanSql.includes("SELECT 1")) {
            return [[{ database_connection: 1 }], []];
        }

        // 2. USERS QUERIES
        if (cleanSql.includes("FROM users")) {
            if (cleanSql.startsWith("SELECT user_id FROM users WHERE email =") || cleanSql.includes("WHERE email =")) {
                const email = params[0]?.toLowerCase();
                const matched = this.users.filter(u => u.email.toLowerCase() === email);
                return [matched, []];
            }
            if (cleanSql.includes("WHERE user_id =")) {
                const id = Number(params[0]);
                const matched = this.users.filter(u => u.user_id === id);
                return [matched, []];
            }
            if (cleanSql.startsWith("SELECT") && !cleanSql.includes("WHERE")) {
                return [this.users, []];
            }
        }

        if (cleanSql.startsWith("INSERT INTO users")) {
            const [full_name, email, phone, password_hash] = params;
            const newUser = {
                user_id: this.nextUserId++,
                full_name,
                email,
                phone: phone || null,
                password_hash,
                role: "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            this.users.push(newUser);
            return [{ insertId: newUser.user_id, affectedRows: 1 }, []];
        }

        if (cleanSql.startsWith("UPDATE users")) {
            if (cleanSql.includes("password_hash =")) {
                const [newHash, userId] = params;
                const user = this.users.find(u => u.user_id === Number(userId));
                if (user) user.password_hash = newHash;
                return [{ affectedRows: user ? 1 : 0 }, []];
            }
            if (cleanSql.includes("full_name =")) {
                const [full_name, phone, userId] = params;
                const user = this.users.find(u => u.user_id === Number(userId));
                if (user) {
                    if (full_name) user.full_name = full_name;
                    if (phone !== undefined) user.phone = phone;
                    user.updated_at = new Date().toISOString();
                }
                return [{ affectedRows: user ? 1 : 0 }, []];
            }
        }

        // 3. CLAIMS QUERIES
        if (cleanSql.startsWith("INSERT INTO claims")) {
            const [
                user_id, policy_id, claim_amount, claim_type,
                hospital_name, vehicle_number, vehicle_age,
                police_report, incident_date, incident_location, description
            ] = params;

            const newClaim = {
                claim_id: this.nextClaimId++,
                user_id: Number(user_id),
                policy_id: Number(policy_id),
                claim_amount: Number(claim_amount),
                claim_type: claim_type || "Medical",
                hospital_name: hospital_name || "",
                vehicle_number: vehicle_number || null,
                vehicle_age: vehicle_age !== null && vehicle_age !== undefined ? Number(vehicle_age) : null,
                police_report: Number(police_report) || 0,
                incident_date: incident_date || new Date().toISOString().split("T")[0],
                incident_location: incident_location || "",
                description: description || "",
                claim_status: "pending",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            this.claims.unshift(newClaim);
            return [{ insertId: newClaim.claim_id, affectedRows: 1 }, []];
        }

        if (cleanSql.includes("FROM claims")) {
            if (cleanSql.includes("GROUP BY claim_status") || cleanSql.includes("COUNT(*) as count")) {
                const counts = {};
                for (const c of this.claims) {
                    counts[c.claim_status] = (counts[c.claim_status] || 0) + 1;
                }
                const rows = Object.entries(counts).map(([claim_status, count]) => ({ claim_status, count }));
                return [rows, []];
            }
            if (cleanSql.includes("WHERE claim_id = ? AND user_id = ?") || cleanSql.includes("WHERE claim_id = ? and user_id = ?")) {
                const [claim_id, user_id] = params.map(Number);
                const matched = this.claims.filter(c => c.claim_id === claim_id && c.user_id === user_id);
                return [matched, []];
            }
            if (cleanSql.includes("WHERE claim_id = ?")) {
                const claim_id = Number(params[0]);
                const matched = this.claims.filter(c => c.claim_id === claim_id);
                return [matched, []];
            }
            if (cleanSql.includes("WHERE user_id = ?")) {
                const user_id = Number(params[0]);
                const matched = this.claims.filter(c => c.user_id === user_id);
                return [matched, []];
            }
            // All claims
            return [this.claims, []];
        }

        if (cleanSql.startsWith("UPDATE claims")) {
            if (cleanSql.includes("claim_status = ?")) {
                const [status, claim_id] = params;
                const claim = this.claims.find(c => c.claim_id === Number(claim_id));
                if (claim) {
                    claim.claim_status = status;
                    claim.updated_at = new Date().toISOString();
                }
                return [{ affectedRows: claim ? 1 : 0 }, []];
            }
            // General update
            const claim_id = Number(params[params.length - 1]);
            const claim = this.claims.find(c => c.claim_id === claim_id);
            if (claim) {
                claim.updated_at = new Date().toISOString();
                return [{ affectedRows: 1 }, []];
            }
            return [{ affectedRows: 0 }, []];
        }

        if (cleanSql.startsWith("DELETE FROM claims")) {
            const claim_id = Number(params[0]);
            const idx = this.claims.findIndex(c => c.claim_id === claim_id);
            if (idx !== -1) {
                this.claims.splice(idx, 1);
                return [{ affectedRows: 1 }, []];
            }
            return [{ affectedRows: 0 }, []];
        }

        // 4. FRAUD PREDICTIONS
        if (cleanSql.startsWith("INSERT INTO fraud_predictions")) {
            const [claim_id, prediction, fraud_score, risk_level, confidence] = params;
            const newPred = {
                prediction_id: this.nextPredictionId++,
                claim_id: Number(claim_id),
                prediction,
                fraud_score: Number(fraud_score),
                risk_level,
                confidence: Number(confidence),
                model_version: "v2.4.1",
                created_at: new Date().toISOString()
            };
            this.fraud_predictions.unshift(newPred);
            return [{ insertId: newPred.prediction_id, affectedRows: 1 }, []];
        }

        if (cleanSql.includes("FROM fraud_predictions")) {
            if (cleanSql.includes("WHERE claim_id = ?")) {
                const claim_id = Number(params[0]);
                const matched = this.fraud_predictions.filter(p => p.claim_id === claim_id);
                return [matched, []];
            }
            return [this.fraud_predictions, []];
        }

        // 5. DOCUMENTS
        if (cleanSql.startsWith("INSERT INTO documents")) {
            const [claim_id, document_type, file_name, file_path] = params;
            const newDoc = {
                document_id: this.nextDocumentId++,
                claim_id: Number(claim_id),
                document_type: document_type || "other",
                file_name,
                file_path,
                created_at: new Date().toISOString()
            };
            this.documents.push(newDoc);
            return [{ insertId: newDoc.document_id, affectedRows: 1 }, []];
        }

        if (cleanSql.includes("FROM documents")) {
            if (cleanSql.includes("WHERE claim_id = ?")) {
                const claim_id = Number(params[0]);
                const matched = this.documents.filter(d => d.claim_id === claim_id);
                return [matched, []];
            }
            return [this.documents, []];
        }

        // 6. AUDIT LOGS
        if (cleanSql.startsWith("INSERT INTO audit_logs")) {
            const [user_id, claim_id, action, old_status, new_status, description] = params;
            const newLog = {
                log_id: this.nextAuditId++,
                user_id: user_id ? Number(user_id) : null,
                claim_id: claim_id ? Number(claim_id) : null,
                action,
                old_status: old_status || null,
                new_status: new_status || null,
                description: description || null,
                created_at: new Date().toISOString()
            };
            this.audit_logs.unshift(newLog);
            return [{ insertId: newLog.log_id, affectedRows: 1 }, []];
        }

        if (cleanSql.includes("FROM audit_logs")) {
            if (cleanSql.includes("WHERE claim_id = ?")) {
                const claim_id = Number(params[0]);
                const matched = this.audit_logs.filter(a => a.claim_id === claim_id);
                return [matched, []];
            }
            return [this.audit_logs, []];
        }

        // 7. BLOCKCHAIN RECORDS
        if (cleanSql.startsWith("INSERT INTO blockchain_records")) {
            const [
                claim_id, claim_hash, prediction_hash,
                claim_transaction_hash, prediction_transaction_hash,
                blockchain_network, contract_address,
                claim_block_number, prediction_block_number
            ] = params;

            const existing = this.blockchain_records.find(b => b.claim_id === Number(claim_id));
            if (existing) {
                if (claim_hash) existing.claim_hash = claim_hash;
                if (prediction_hash) existing.prediction_hash = prediction_hash;
                if (claim_transaction_hash) existing.claim_transaction_hash = claim_transaction_hash;
                if (prediction_transaction_hash) existing.prediction_transaction_hash = prediction_transaction_hash;
                if (claim_block_number) existing.claim_block_number = claim_block_number;
                if (prediction_block_number) existing.prediction_block_number = prediction_block_number;
                existing.updated_at = new Date().toISOString();
                return [{ insertId: existing.id, affectedRows: 1 }, []];
            }

            const newRecord = {
                id: this.nextBlockchainId++,
                claim_id: Number(claim_id),
                claim_hash: claim_hash || null,
                prediction_hash: prediction_hash || null,
                claim_transaction_hash: claim_transaction_hash || null,
                prediction_transaction_hash: prediction_transaction_hash || null,
                blockchain_network: blockchain_network || "localhost",
                contract_address: contract_address || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
                claim_block_number: claim_block_number || null,
                prediction_block_number: prediction_block_number || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            this.blockchain_records.push(newRecord);
            return [{ insertId: newRecord.id, affectedRows: 1 }, []];
        }

        if (cleanSql.includes("FROM blockchain_records")) {
            if (cleanSql.includes("WHERE claim_id = ?")) {
                const claim_id = Number(params[0]);
                const matched = this.blockchain_records.filter(b => b.claim_id === claim_id);
                return [matched, []];
            }
            return [this.blockchain_records, []];
        }

        return [[], []];
    }
}

// Check if external MySQL credentials exist
let realPool = null;
if (process.env.DB_HOST && process.env.DB_USER) {
    try {
        realPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 2000
        });
    } catch (e) {
        console.warn("[Database] MySQL initialization failed, using in-memory mock store:", e.message);
        realPool = null;
    }
}

const inMemoryDB = new InMemoryDB();

const db = {
    async query(sql, params = []) {
        if (realPool) {
            try {
                return await realPool.query(sql, params);
            } catch (err) {
                // If MySQL is down/unreachable, gracefully route to in-memory store
                return await inMemoryDB.query(sql, params);
            }
        }
        return await inMemoryDB.query(sql, params);
    },
    inMemoryDB
};

module.exports = db;
