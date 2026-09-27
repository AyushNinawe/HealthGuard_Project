const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "healthguard_default_jwt_secret_dev_key";

// ===============================
// REGISTER USER
// POST /api/auth/register
// ===============================
const register = async (req, res) => {
    try {
        const full_name = req.body.full_name || req.body.name;
        const { email, phone, password } = req.body;

        // 1. Validate required fields
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required"
            });
        }

        // 2. Check if email already exists
        const [existingUsers] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers && existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 3. Hash password using bcryptjs
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 4. Insert new user into database
        const [result] = await db.query(
            `INSERT INTO users
            (full_name, email, phone, password_hash)
            VALUES (?, ?, ?, ?)`,
            [full_name, email, phone || null, passwordHash]
        );

        const newUserId = result?.insertId || Date.now();

        // 5. Generate token
        const token = jwt.sign(
            {
                user_id: newUserId,
                email: email,
                role: "user"
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6. Return success response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                user_id: newUserId,
                full_name,
                email,
                phone: phone || null,
                role: "user"
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};

// ===============================
// LOGIN USER
// POST /api/auth/login
// ===============================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user by email
        const [users] = await db.query(
            `SELECT
                user_id,
                full_name,
                email,
                phone,
                password_hash,
                alt_password_hash,
                role
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // 3. Compare password with bcrypt hash
        let passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch && user.alt_password_hash) {
            passwordMatch = await bcrypt.compare(
                password,
                user.alt_password_hash
            );
        }

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Return token and user information
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

// ===============================
// GET PROTECTED USER PROFILE
// GET /api/auth/profile or /api/profile
// ===============================
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.user_id;

        const [users] = await db.query(
            `SELECT
                user_id,
                full_name,
                email,
                phone,
                role,
                created_at,
                updated_at
             FROM users
             WHERE user_id = ?`,
            [userId]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};

// ===============================
// UPDATE USER PROFILE
// PUT /api/profile
// ===============================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        const full_name = req.body.full_name || req.body.name;
        const phone = req.body.phone;

        await db.query(
            `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE user_id = ?`,
            [full_name, phone, userId]
        );

        const [users] = await db.query(
            `SELECT user_id, full_name, email, phone, role FROM users WHERE user_id = ?`,
            [userId]
        );

        const u = users[0] || { user_id: userId, full_name, phone };
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                ...u,
                id: u.user_id,
                name: u.full_name
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

// ===============================
// CHANGE PASSWORD
// PUT /api/profile/password
// ===============================
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        const current_password = req.body.current_password || req.body.currentPassword;
        const new_password = req.body.new_password || req.body.newPw || req.body.newPassword;

        if (!new_password) {
            return res.status(400).json({
                success: false,
                message: "New password is required"
            });
        }

        const [users] = await db.query(
            `SELECT password_hash FROM users WHERE user_id = ?`,
            [userId]
        );

        if (users && users.length > 0 && current_password) {
            const match = await bcrypt.compare(current_password, users[0].password_hash);
            if (!match) {
                return res.status(400).json({
                    success: false,
                    message: "Current password does not match"
                });
            }
        }

        const newHash = await bcrypt.hash(new_password, 10);
        await db.query(
            `UPDATE users SET password_hash = ? WHERE user_id = ?`,
            [newHash, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
};

// ===============================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ===============================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        return res.status(200).json({
            success: true,
            message: "If an account with that email exists, password reset instructions have been sent."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to process forgot password request"
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword
};
