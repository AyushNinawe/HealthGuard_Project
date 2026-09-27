const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllClaims,
    getClaimDetails,
    updateClaimStatus,
    approveClaim,
    rejectClaim,
    getAllUsers,
    getDashboardSummary
} = require("../controllers/adminController");

const { getAuditHistory } = require("../controllers/auditController");

router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardSummary);
router.get("/stats", authMiddleware, adminMiddleware, getDashboardSummary);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/claims", authMiddleware, adminMiddleware, getAllClaims);
router.get("/claims/:id", authMiddleware, adminMiddleware, getClaimDetails);
router.patch("/claims/:id/status", authMiddleware, adminMiddleware, updateClaimStatus);
router.put("/claims/:id/approve", authMiddleware, adminMiddleware, approveClaim);
router.put("/claims/:id/reject", authMiddleware, adminMiddleware, rejectClaim);
router.get("/claims/:id/audit", authMiddleware, adminMiddleware, getAuditHistory);

module.exports = router;
