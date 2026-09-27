const express = require("express");
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/password", authMiddleware, changePassword);

module.exports = router;
