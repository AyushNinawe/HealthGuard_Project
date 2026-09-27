const express = require("express");

const router = express.Router();

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// CLAIM CONTROLLERS
// ==========================================
const {
    createClaim,
    getUserClaims,
    getClaimById,
    updateClaim,
    deleteClaim
} = require("../controllers/claimController");


// ==========================================
// GET ALL CLAIMS FOR LOGGED-IN USER
// GET /api/claims
// ==========================================
router.get(
    "/",
    authMiddleware,
    getUserClaims
);


// ==========================================
// CREATE NEW CLAIM
// POST /api/claims
// ==========================================
router.post(
    "/",
    authMiddleware,
    createClaim
);


// ==========================================
// GET CLAIM BY ID
// GET /api/claims/:id
// ==========================================
router.get(
    "/:id",
    authMiddleware,
    getClaimById
);


// ==========================================
// UPDATE CLAIM BY ID
// PUT /api/claims/:id
// ==========================================
router.put(
    "/:id",
    authMiddleware,
    updateClaim
);


// ==========================================
// DELETE CLAIM BY ID
// DELETE /api/claims/:id
// ==========================================
router.delete(
    "/:id",
    authMiddleware,
    deleteClaim
);


module.exports = router;

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================


// ==========================================
// CLAIM CONTROLLERS

// ==========================================
// GET ALL CLAIMS FOR LOGGED-IN USER
// GET /api/claims
// ==========================================
router.get(
    "/",
    authMiddleware,
    getUserClaims
);


// ==========================================
// CREATE NEW CLAIM
// POST /api/claims
// ==========================================
router.post(
    "/",
    authMiddleware,
    createClaim
);


// ==========================================
// GET CLAIM BY ID
// GET /api/claims/:id
// ==========================================
router.get(
    "/:id",
    authMiddleware,
    getClaimById
);


// ==========================================
// UPDATE CLAIM BY ID
// PUT /api/claims/:id
// ==========================================
router.put(
    "/:id",
    authMiddleware,
    updateClaim
);


// ==========================================
// DELETE CLAIM BY ID
// DELETE /api/claims/:id
// ==========================================
router.delete(
    "/:id",
    authMiddleware,
    deleteClaim
);


module.exports = router;

// ==========================================
// AUTHENTICATION MIDDLEWARE
// =========================================

// ==========================================
// CLAIM CONTROLLERS
// ========================================
// ==========================================
// GET ALL CLAIMS FOR LOGGED-IN USER
// GET /api/claims
// ==========================================
router.get(
    "/",
    authMiddleware,
    getUserClaims
);


// ==========================================
// CREATE NEW CLAIM
// POST /api/claims
// ==========================================
router.post(
    "/",
    authMiddleware,
    createClaim
);


// ==========================================
// GET CLAIM BY ID
// GET /api/claims/:id
// ==========================================
router.get(
    "/:id",
    authMiddleware,
    getClaimById
);


// ==========================================
// UPDATE CLAIM BY ID
// PUT /api/claims/:id
// ==========================================
router.put(
    "/:id",
    authMiddleware,
    updateClaim
);


// ==========================================
// DELETE CLAIM BY ID
// DELETE /api/claims/:id
// ==========================================
router.delete(
    "/:id",
    authMiddleware,
    deleteClaim
);


module.exports = router;