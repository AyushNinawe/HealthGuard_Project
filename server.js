import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Backend routes and controllers
const authRoutes = require("./backend/routes/authRoutes.js");
const claimRoutes = require("./backend/routes/claimRoutes.js");
const documentRoutes = require("./backend/routes/documentRoutes.js");
const predictionRoutes = require("./backend/routes/prediction.js");
const adminRoutes = require("./backend/routes/adminRoutes.js");
const blockchainRoutes = require("./backend/routes/blockchainRoutes.js");
const { getDashboardSummary } = require("./backend/controllers/adminController.js");
const { getProfile, updateProfile, changePassword } = require("./backend/controllers/authController.js");
const { getAnalytics, getModelInfo, getReports, getHistory, retrainModel } = require("./backend/controllers/predictionController.js");
const authMiddleware = require("./backend/middleware/authMiddleware.js");
const db = require("./backend/config/db.js");

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve uploads directory
    const uploadsDir = path.resolve(__dirname, "backend/uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use("/uploads", express.static(uploadsDir));

    // ==========================================
    // BACKEND API ROUTES
    // ==========================================
    app.use("/api/auth", authRoutes);
    app.use("/api/claims", claimRoutes);
    app.use("/api/documents", documentRoutes);
    app.use("/api/predictions", predictionRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/blockchain", blockchainRoutes);

    // AI & Profile convenience routes called by frontend services
    app.get("/api/dashboard", authMiddleware, getDashboardSummary);
    app.get("/api/profile", authMiddleware, getProfile);
    app.put("/api/profile", authMiddleware, updateProfile);
    app.put("/api/profile/password", authMiddleware, changePassword);
    app.get("/api/analytics", getAnalytics);
    app.get("/api/model-info", getModelInfo);
    app.get("/api/reports", getReports);
    app.get("/api/prediction-history", getHistory);
    app.post("/api/retrain-model", authMiddleware, retrainModel);

    // Health Checks
    app.get("/api/health", (req, res) => {
        res.status(200).json({
            status: "OK",
            message: "HealthGuard API is running",
            timestamp: new Date().toISOString()
        });
    });

    app.get("/api/health/db", async (req, res) => {
        try {
            const [rows] = await db.query("SELECT 1 AS database_connection");
            res.status(200).json({
                status: "OK",
                message: "Database connection active",
                result: rows
            });
        } catch (error) {
            res.status(500).json({
                status: "ERROR",
                message: "Database connection check failed",
                error: error.message
            });
        }
    });

    app.get("/api/health/blockchain", async (req, res) => {
        try {
            const { getBlockchainStatus } = require("./backend/services/blockchainService.js");
            const blockchainStatus = await getBlockchainStatus();
            res.status(200).json({
                status: "OK",
                message: "Blockchain configuration loaded",
                ...blockchainStatus
            });
        } catch (error) {
            res.status(200).json({
                status: "DEGRADED",
                message: "Blockchain health check in fallback mode",
                error: error.message
            });
        }
    });

    // ==========================================
    // FRONTEND INTEGRATION
    // ==========================================
    const isProduction = process.env.NODE_ENV === "production";
    const distDir = path.resolve(__dirname, "frontend/dist");

    if (!isProduction) {
        // Dev mode: Mount Vite dev server middleware
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
            server: { middlewareMode: true, hmr: false },
            appType: "spa",
            root: path.resolve(__dirname, "frontend"),
        });
        app.use(vite.middlewares);
    } else {
        // Production: serve built static files
        app.use(express.static(distDir));
        app.get("*", (req, res) => {
            res.sendFile(path.resolve(distDir, "index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`=================================`);
        console.log(`HealthGuard server listening on http://0.0.0.0:${PORT}`);
        console.log(`Environment: ${isProduction ? "production" : "development"}`);
        console.log(`=================================`);
    });
}

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
