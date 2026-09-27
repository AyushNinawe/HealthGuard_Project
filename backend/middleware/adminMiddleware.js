// ==========================================
// ADMIN AUTHORIZATION MIDDLEWARE
// ==========================================

const adminMiddleware = (req, res, next) => {
    try {

        // Make sure authentication middleware
        // has already attached the user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // Check user's role
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });
        }

        // User is an admin
        next();

    } catch (error) {

        console.error("Admin middleware error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Authorization failed."
        });
    }
};

module.exports = adminMiddleware;