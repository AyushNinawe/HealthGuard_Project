const express = require("express");
const router = express.Router();

const {
    predictClaim,
    getPrediction,
    getHistory,
    getAnalytics,
    getModelInfo,
    retrainModel,
    getReports
} = require("../controllers/predictionController");

const authMiddleware = require("../middleware/authMiddleware");

// AI endpoints
router.get("/analytics", getAnalytics);
router.get("/model-info", getModelInfo);
router.post("/retrain-model", authMiddleware, retrainModel);
router.get("/reports", getReports);
router.get("/history", getHistory);
router.get("/", getHistory);

// Claim-specific predictions
router.post("/:claimId", authMiddleware, predictClaim);
router.get("/:claimId", authMiddleware, getPrediction);

module.exports = router;
