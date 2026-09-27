const db = require("../config/db");

// ============================================================
// CREATE AUDIT LOG
// ============================================================

const createAuditLog = async ({
    userId = null,
    claimId = null,
    action,
    oldStatus = null,
    newStatus = null,
    description = null
}) => {

    try {

        await db.query(
            `
            INSERT INTO audit_logs (
                user_id,
                claim_id,
                action,
                old_status,
                new_status,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                claimId,
                action,
                oldStatus,
                newStatus,
                description
            ]
        );

        console.log(
            `Audit log created: ${action}`
        );

        return true;

    } catch (error) {

        console.error(
            "Create audit log error:",
            error.message
        );

        return false;
    }
};


// ============================================================
// GET AUDIT HISTORY FOR CLAIM
// GET /api/admin/claims/:id/audit
// ============================================================

const getAuditHistory = async (req, res) => {

    try {

        // Get claim ID from URL
        const claimId = req.params.id;


        // =====================================================
        // GET AUDIT LOGS
        // =====================================================

        const [logs] = await db.query(
            `
            SELECT
                log_id,
                user_id,
                claim_id,
                action,
                old_status,
                new_status,
                description,
                created_at
            FROM audit_logs
            WHERE claim_id = ?
            ORDER BY created_at DESC
            `,
            [claimId]
        );


        // =====================================================
        // RETURN AUDIT HISTORY
        // =====================================================

        res.status(200).json({

            success: true,

            claim_id: claimId,

            count: logs.length,

            audit_logs: logs

        });


    } catch (error) {

        console.error(
            "Get audit history error:",
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch audit history.",

            error:
                error.message

        });

    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    createAuditLog,
    getAuditHistory
};