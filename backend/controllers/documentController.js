const db = require("../config/db");
const path = require("path");

// ==========================================
// UPLOAD DOCUMENT
// POST /api/documents/upload or POST /api/documents
// ==========================================
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a document."
            });
        }

        const {
            claim_id,
            document_type
        } = req.body;

        const effectiveClaimId = claim_id || 1;

        const fileName = req.file.originalname;
        const filePath = `/uploads/${req.file.filename}`;

        const [result] = await db.query(
            `INSERT INTO documents
            (
                claim_id,
                document_type,
                file_name,
                file_path
            )
            VALUES (?, ?, ?, ?)`,
            [
                effectiveClaimId,
                document_type || "supporting_document",
                fileName,
                filePath
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully.",
            document_id: result?.insertId || Date.now(),
            claim_id: effectiveClaimId,
            document_type: document_type || "supporting_document",
            file_name: fileName,
            file_path: filePath
        });

    } catch (error) {
        console.error("Upload document error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to upload document.",
            error: error.message
        });
    }
};

// ==========================================
// GET DOCUMENTS FOR A CLAIM
// GET /api/documents/:claimId
// ==========================================
const getDocuments = async (req, res) => {
    try {
        const { claimId } = req.params;

        const [documents] = await db.query(
            `SELECT * FROM documents WHERE claim_id = ? ORDER BY created_at DESC`,
            [claimId]
        );

        return res.status(200).json({
            success: true,
            count: (documents || []).length,
            documents: documents || []
        });
    } catch (error) {
        console.error("Get documents error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch documents.",
            error: error.message
        });
    }
};

// ==========================================
// GET ALL DOCUMENTS
// GET /api/documents
// ==========================================
const getAllDocuments = async (req, res) => {
    try {
        const [documents] = await db.query(
            `SELECT * FROM documents ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            count: (documents || []).length,
            documents: documents || []
        });
    } catch (error) {
        console.error("Get all documents error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch documents.",
            error: error.message
        });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    getAllDocuments
};
