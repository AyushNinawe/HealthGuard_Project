const db = require("../config/db");

// ==========================================
// AUDIT CONTROLLER
// ==========================================
const { createAuditLog } = require("./auditController");


// ==========================================
// CREATE NEW CLAIM
// POST /api/claims
// ==========================================
const createClaim = async (req, res) => {
    try {
        // Get logged-in user's ID from JWT
        const userId = req.user.user_id;

        const {
            policy_id,
            policyNumber,
            claim_amount,
            claimAmount,
            claim_type,
            claimType,
            hospital_name,
            hospitalName,
            vehicle_number,
            vehicleNumber,
            vehicle_age,
            vehicleAge,
            police_report,
            policeReport,
            incident_date,
            incidentDate,
            incident_location,
            incidentLocation,
            description
        } = req.body;

        const effectivePolicyId = policy_id || policyNumber || "POL-2026-DEFAULT";
        const effectiveClaimAmount = claim_amount || claimAmount;
        const effectiveClaimType = claim_type || claimType || "Medical";
        const effectiveHospitalName = hospital_name || hospitalName || null;
        const effectiveVehicleNumber = vehicle_number || vehicleNumber || null;
        const effectiveVehicleAge = vehicle_age || vehicleAge || null;
        const effectivePoliceReport = (police_report === "Yes" || policeReport === "Yes" || police_report === 1 || police_report === true) ? 1 : 0;
        const effectiveIncidentDate = incident_date || incidentDate || new Date().toISOString().slice(0, 10);
        const effectiveIncidentLocation = incident_location || incidentLocation || "General Location";
        const effectiveDescription = description || "No detailed description provided";

        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (!effectiveClaimAmount) {
            return res.status(400).json({
                success: false,
                message: "claim_amount is required."
            });
        }

        // ==========================================
        // INSERT CLAIM INTO DATABASE
        // ==========================================

        const [result] = await db.query(
            `INSERT INTO claims
            (
                user_id,
                policy_id,
                claim_amount,
                claim_type,
                hospital_name,
                vehicle_number,
                vehicle_age,
                police_report,
                incident_date,
                incident_location,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                effectivePolicyId,
                effectiveClaimAmount,
                effectiveClaimType,
                effectiveHospitalName,
                effectiveVehicleNumber,
                effectiveVehicleAge,
                effectivePoliceReport,
                effectiveIncidentDate,
                effectiveIncidentLocation,
                effectiveDescription
            ]
        );

        // ==========================================
        // GET NEW CLAIM ID
        // ==========================================

        const claimId = result.insertId;

        // ==========================================
        // 8.3 CREATE AUDIT LOG
        // ==========================================

        await createAuditLog({
            userId: userId,
            claimId: claimId,
            action: "CLAIM_CREATED",
            oldStatus: null,
            newStatus: "pending",
            description: "Claim created successfully."
        });

        // ==========================================
        // BLOCKCHAIN: STORE CLAIM HASH
        // ==========================================

        let blockchainResult = null;
        let blockchainError = null;

        try {
            const [savedClaims] = await db.query(
                `SELECT *
                 FROM claims
                 WHERE claim_id = ?`,
                [claimId]
            );

            const savedClaim = savedClaims[0];
            const {
                generateClaimHash,
                storeClaimHash,
                isBlockchainConfigured,
            } = require("../services/blockchainService.js");

            if (isBlockchainConfigured()) {
                blockchainResult = await storeClaimHash(
                    claimId,
                    generateClaimHash(savedClaim)
                );

                await createAuditLog({
                    userId: userId,
                    claimId: claimId,
                    action: "CLAIM_HASH_STORED",
                    oldStatus: null,
                    newStatus: "pending",
                    description: `Claim hash stored on blockchain. Tx: ${blockchainResult.txHash}`,
                });
            } else {
                blockchainError = "Blockchain not configured. Skipping on-chain storage.";
                console.warn(`[blockchain] ${blockchainError}`);
            }
        } catch (chainError) {
            blockchainError = chainError.message;
            console.error(
                "Blockchain claim hash storage failed:",
                chainError.message
            );
        }

        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(201).json({
            success: true,
            message: "Claim created successfully.",
            claim_id: claimId,
            claimId: claimId,
            blockchain: blockchainResult
                ? {
                    stored: true,
                    claim_hash: blockchainResult.claimHash,
                    tx_hash: blockchainResult.txHash,
                    block_number: blockchainResult.blockNumber,
                }
                : {
                    stored: false,
                    message: blockchainError || "Blockchain storage skipped.",
                },
        });

    } catch (error) {

        console.error(
            "Create claim error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to create claim.",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL CLAIMS FOR LOGGED-IN USER
// GET /api/claims
// ==========================================
const getUserClaims = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role;

        // If admin, show all claims; if user, show user's claims
        let query = `SELECT c.*, u.full_name, u.email FROM claims c LEFT JOIN users u ON c.user_id = u.user_id`;
        let params = [];

        if (userRole !== 'admin') {
            query += ` WHERE c.user_id = ?`;
            params.push(userId);
        }

        query += ` ORDER BY c.created_at DESC`;

        const [claims] = await db.query(query, params);
        const [predictions] = await db.query(`SELECT * FROM fraud_predictions`);

        const formatted = (claims || []).map((c) => {
            const pred = (predictions || []).find(p => p.claim_id === c.claim_id);
            return {
                id: `CLM-${String(c.claim_id).padStart(3, '0')}`,
                claimId: c.claim_id,
                claim_id: c.claim_id,
                customerName: c.full_name || (c.hospital_name ? `Claim #${c.claim_id} (${c.hospital_name})` : `Patient #${c.claim_id}`),
                claimType: c.claim_type || "Medical",
                claimAmount: Number(c.claim_amount || 0),
                status: c.claim_status ? (c.claim_status.charAt(0).toUpperCase() + c.claim_status.slice(1)) : "Pending",
                prediction: pred ? {
                    prediction: pred.prediction,
                    riskLevel: pred.risk_level,
                    confidence: pred.confidence,
                    fraudProbability: (pred.fraud_score || 0) / 100
                } : null,
                createdAt: c.created_at || new Date().toISOString()
            };
        });

        res.status(200).json({
            success: true,
            count: formatted.length,
            total: formatted.length,
            claims: formatted
        });

    } catch (error) {
        console.error("Get user claims error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch claims.",
            error: error.message
        });
    }
};


// ==========================================
// GET CLAIM BY ID
// GET /api/claims/:id
// ==========================================
const getClaimById = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role;
        const rawId = req.params.id;
        // Support both numeric "5" and string "CLM-005"
        const claimId = Number(String(rawId).replace(/[^0-9]/g, '')) || rawId;

        // If admin, can view any claim; if standard user, must be their claim
        let query = `SELECT c.*, u.full_name, u.email, u.phone FROM claims c LEFT JOIN users u ON c.user_id = u.user_id WHERE c.claim_id = ?`;
        let params = [claimId];

        if (userRole !== 'admin') {
            query += ` AND c.user_id = ?`;
            params.push(userId);
        }

        const [claims] = await db.query(query, params);

        if (claims.length === 0) {
            // Also try by policy_id as fallback
            const [fallbackClaims] = await db.query(
                `SELECT c.*, u.full_name, u.email, u.phone FROM claims c LEFT JOIN users u ON c.user_id = u.user_id WHERE c.policy_id = ?`,
                [rawId]
            );
            if (fallbackClaims.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Claim not found."
                });
            }
            claims.push(fallbackClaims[0]);
        }

        const c = claims[0];

        // Fetch documents and latest prediction
        const [docs] = await db.query(
            `SELECT * FROM documents WHERE claim_id = ? ORDER BY created_at DESC`,
            [c.claim_id]
        );

        const [preds] = await db.query(
            `SELECT * FROM fraud_predictions WHERE claim_id = ? ORDER BY created_at DESC LIMIT 1`,
            [c.claim_id]
        );

        const latestPred = preds && preds[0] ? preds[0] : null;

        const formattedClaim = {
            id: `CLM-${String(c.claim_id).padStart(3, '0')}`,
            claimId: c.claim_id,
            claim_id: c.claim_id,
            userId: c.user_id,
            customerName: c.full_name || `Patient #${c.claim_id}`,
            email: c.email || 'user@healthguard.com',
            phone: c.phone || '+1 555-0199',
            age: c.vehicle_age || 35,
            gender: 'Not specified',
            policyNumber: c.policy_id || `POL-2024-${String(c.claim_id).padStart(6, '0')}`,
            policyStartDate: c.created_at || '2024-01-15',
            policyExpiryDate: '2027-01-14',
            claimAmount: Number(c.claim_amount || 0),
            claimType: c.claim_type || 'Medical',
            hospitalName: c.hospital_name || '',
            vehicleNumber: c.vehicle_number || '',
            vehicleAge: c.vehicle_age || '',
            policeReport: c.police_report ? 'Yes' : 'No',
            incidentDate: c.incident_date ? new Date(c.incident_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            incidentLocation: c.incident_location || 'Not specified',
            description: c.description || 'No description provided',
            status: c.claim_status ? (c.claim_status.charAt(0).toUpperCase() + c.claim_status.slice(1)) : 'Pending',
            documents: (docs || []).map(d => ({
                id: `d-${d.document_id}`,
                document_id: d.document_id,
                type: d.document_type || 'supporting_document',
                fileName: d.file_name || 'document.pdf',
                fileSize: 120000,
                filePath: d.file_path,
                uploadedAt: d.created_at ? new Date(d.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
            })),
            prediction: latestPred ? {
                prediction: latestPred.prediction,
                confidenceScore: (latestPred.confidence || 90) / 100,
                fraudProbability: (latestPred.fraud_score || 10) / 100,
                genuineProbability: 1 - ((latestPred.fraud_score || 10) / 100),
                riskLevel: latestPred.risk_level || 'Low',
                reasons: [
                    `Fraud score calculated at ${latestPred.fraud_score}%`,
                    `Model confidence level rated at ${latestPred.confidence}%`,
                    `Evaluated against recent healthcare claim patterns`
                ],
                recommendedAction: latestPred.prediction === 'Fraud' ? 'Escalate for investigator audit.' : 'Auto-approval criteria met.',
                analyzedAt: latestPred.created_at || new Date().toISOString()
            } : null,
            createdAt: c.created_at,
            updatedAt: c.updated_at
        };

        return res.status(200).json({
            success: true,
            claim: formattedClaim,
            data: formattedClaim
        });

    } catch (error) {
        console.error("Get claim by ID error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch claim.",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE CLAIM BY ID
// PUT /api/claims/:id
// ==========================================
const updateClaim = async (req, res) => {
    try {

        // Get logged-in user's ID from JWT
        const userId = req.user.user_id;

        // Get claim ID from URL
        const claimId = req.params.id;

        // Get updated data
        const {
            policy_id,
            claim_amount,
            claim_type,
            hospital_name,
            vehicle_number,
            vehicle_age,
            police_report,
            incident_date,
            incident_location,
            description
        } = req.body;

        // ==========================================
        // CHECK CLAIM EXISTS
        // ==========================================

        const [existingClaim] = await db.query(
            `SELECT claim_id
             FROM claims
             WHERE claim_id = ?
             AND user_id = ?`,
            [claimId, userId]
        );

        // Claim not found
        if (existingClaim.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Claim not found."
            });
        }

        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (!policy_id || !claim_amount) {
            return res.status(400).json({
                success: false,
                message: "policy_id and claim_amount are required."
            });
        }

        // ==========================================
        // UPDATE CLAIM
        // ==========================================

        await db.query(
            `UPDATE claims
             SET
                policy_id = ?,
                claim_amount = ?,
                claim_type = ?,
                hospital_name = ?,
                vehicle_number = ?,
                vehicle_age = ?,
                police_report = ?,
                incident_date = ?,
                incident_location = ?,
                description = ?
             WHERE claim_id = ?
             AND user_id = ?`,
            [
                policy_id,
                claim_amount,
                claim_type || null,
                hospital_name || null,
                vehicle_number || null,
                vehicle_age || null,
                police_report || 0,
                incident_date || null,
                incident_location || null,
                description || null,
                claimId,
                userId
            ]
        );

        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,
            message: "Claim updated successfully.",
            claim_id: claimId
        });

    } catch (error) {

        console.error(
            "Update claim error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to update claim.",
            error: error.message
        });
    }
};


// ==========================================
// DELETE CLAIM BY ID
// DELETE /api/claims/:id
// ==========================================
const deleteClaim = async (req, res) => {
    try {

        // Get logged-in user's ID from JWT
        const userId = req.user.user_id;

        // Get claim ID from URL
        const claimId = req.params.id;

        // ==========================================
        // CHECK CLAIM EXISTS
        // ==========================================

        const [existingClaim] = await db.query(
            `SELECT claim_id
             FROM claims
             WHERE claim_id = ?
             AND user_id = ?`,
            [claimId, userId]
        );

        // Claim not found
        if (existingClaim.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Claim not found."
            });
        }

        // ==========================================
        // DELETE CLAIM
        // ==========================================

        await db.query(
            `DELETE FROM claims
             WHERE claim_id = ?
             AND user_id = ?`,
            [claimId, userId]
        );

        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,
            message: "Claim deleted successfully.",
            claim_id: claimId
        });

    } catch (error) {

        console.error(
            "Delete claim error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete claim.",
            error: error.message
        });
    }
};


// ==========================================
// EXPORT ALL CLAIM CONTROLLERS
// ==========================================
module.exports = {
    createClaim,
    getUserClaims,
    getClaimById,
    updateClaim,
    deleteClaim
};
