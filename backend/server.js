const express = require("express");
const cors = require("cors");
const predictionRoutes = require("./routes/prediction");
require("dotenv").config();

const db = require("./config/db");

// ==========================================
// IMPORT ROUTES
// ==========================================

// Authentication Routes
const authRoutes = require("./routes/authRoutes");

// Claim Routes
const claimRoutes = require("./routes/claimRoutes");

// Document Routes
const documentRoutes = require("./routes/documentRoutes");

// Admin Routes
const adminRoutes = require("./routes/adminRoutes");

// Blockchain Routes
const blockchainRoutes = require("./routes/blockchainRoutes");


const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);


// ==========================================
// CLAIM ROUTES
// ==========================================

app.use(
    "/api/claims",
    claimRoutes
);


// ==========================================
// DOCUMENT ROUTES
// ==========================================

app.use(
    "/api/documents",
    documentRoutes
);


// ==========================================
// PREDICTION ROUTES
// ==========================================

app.use(
    "/api/predictions",
    predictionRoutes
);


// ==========================================
// ADMIN ROUTES
// ==========================================

app.use(
    "/api/admin",
    adminRoutes
);


// ==========================================
// BLOCKCHAIN ROUTES
// ==========================================

app.use(
    "/api/blockchain",
    blockchainRoutes
);


// ==========================================
// BASIC BACKEND TEST
// ==========================================

app.get("/", (req, res) => {

    res.status(200).send(
        "Healthcare Fraud Detection Backend is Working!"
    );

});


// ==========================================
// BACKEND HEALTH CHECK
// ==========================================

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            status: "OK",

            message:
                "Backend is running"

        });

    }
);


// ==========================================
// DATABASE HEALTH CHECK
// ==========================================

app.get(
    "/api/health/db",
    async (req, res) => {

        try {

            const [rows] = await db.query(
                "SELECT 1 AS database_connection"
            );

            res.status(200).json({

                status: "OK",

                message:
                    "MySQL database connected successfully",

                database:
                    process.env.DB_NAME,

                result:
                    rows

            });

        } catch (error) {

            console.error(
                "Database connection error:",
                error.message
            );

            res.status(500).json({

                status: "ERROR",

                message:
                    "MySQL database connection failed",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// BLOCKCHAIN HEALTH CHECK
// ==========================================

app.get(
    "/api/health/blockchain",
    async (req, res) => {

        try {

            const { getBlockchainStatus } = await import(
                "./services/blockchainService.js"
            );

            const blockchainStatus = await getBlockchainStatus();

            res.status(200).json({

                status: "OK",

                message:
                    "Blockchain configuration loaded",

                ...blockchainStatus

            });

        } catch (error) {

            console.error(
                "Blockchain health check error:",
                error.message
            );

            res.status(500).json({

                status: "ERROR",

                message:
                    "Blockchain health check failed",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 5001;


app.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "Backend started successfully"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            "================================="
        );

    }
);