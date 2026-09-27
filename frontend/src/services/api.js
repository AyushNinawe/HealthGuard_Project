/**
 * Axios API Service Layer
 *
 * All frontend communication with the Node.js backend
 * goes through this file.
 */

import axios from "axios";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
    baseURL: "/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============================================================
// REQUEST INTERCEPTOR
// Attach JWT token to every protected request
// ============================================================

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("jwt_token");

        if (token) {

            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// ============================================================
// RESPONSE INTERCEPTOR
// Global authentication error handling
// ============================================================

api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem(
                "jwt_token"
            );

            // Avoid redirect loop if already on login page
            if (
                window.location.pathname !==
                "/login"
            ) {
                window.location.href =
                    "/login";
            }
        }

        return Promise.reject(error);
    }
);


// ============================================================
// AUTH SERVICES
// ============================================================

export const authService = {

    /**
     * POST /api/auth/login
     *
     * Request:
     * {
     *   email,
     *   password
     * }
     */
    login: (credentials) =>
        api
            .post("/auth/login", credentials)
            .then((response) => response.data),

    /**
     * POST /api/auth/register
     */
    register: (data) =>
        api
            .post("/auth/register", data)
            .then((response) => response.data),

    /**
     * POST /api/auth/forgot-password
     */
    forgotPassword: (data) =>
        api
            .post("/auth/forgot-password", data)
            .then((response) => response.data),
};


// ============================================================
// CLAIM SERVICES
// ============================================================

export const claimService = {

    /**
     * GET /api/claims
     *
     * Get claims belonging to logged-in user.
     */
    getClaims: (params = {}) =>
        api
            .get("/claims", { params })
            .then((response) => response.data),

    /**
     * POST /api/claims
     *
     * Create a new claim.
     */
    createClaim: (claimData) =>
        api
            .post("/claims", claimData)
            .then((response) => response.data),

    submitClaim: (claimData) =>
        api
            .post("/claims", claimData)
            .then((response) => response.data),

    /**
     * GET /api/claims/:id
     *
     * Get a single claim.
     */
    getClaimById: (claimId) =>
        api
            .get(`/claims/${claimId}`)
            .then((response) => response.data),

    /**
     * PUT /api/claims/:id
     *
     * Update claim.
     */
    updateClaim: (claimId, updates) =>
        api
            .put(`/claims/${claimId}`, updates)
            .then((response) => response.data),

    /**
     * DELETE /api/claims/:id
     *
     * Delete claim.
     */
    deleteClaim: (claimId) =>
        api
            .delete(`/claims/${claimId}`)
            .then((response) => response.data),
};


// ============================================================
// DOCUMENT SERVICES
// ============================================================

export const documentService = {

    /**
     * GET /api/documents
     *
     * Get all documents.
     */
    getAllDocuments: () =>
        api
            .get("/documents")
            .then((response) => response.data),

    /**
     * POST /api/documents
     *
     * Upload supporting claim documents.
     */
    uploadDocument: (formData) =>
        api
            .post("/documents", formData, {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            })
            .then((response) => response.data),

    /**
     * GET /api/documents/:claimId
     *
     * Get documents for a claim.
     */
    getDocuments: (claimId) =>
        api
            .get(`/documents/${claimId}`)
            .then((response) => response.data),
};


// ============================================================
// FRAUD PREDICTION SERVICES
// ============================================================

export const predictionService = {

    /**
     * POST /api/predictions/:claimId
     *
     * Run fraud prediction for a claim.
     *
     * Example response:
     *
     * {
     *   success: true,
     *   message: "Fraud prediction completed successfully.",
     *   claim_id: "5",
     *   prediction: "Genuine",
     *   fraud_score: 4,
     *   risk_level: "Low",
     *   confidence: 96
     * }
     */
    predict: (claimId) =>
        api
            .post(`/predictions/${claimId}`)
            .then((response) => response.data),

    /**
     * GET /api/predictions/:claimId
     *
     * Get previously stored prediction.
     */
    getPrediction: (claimId) =>
        api
            .get(`/predictions/${claimId}`)
            .then((response) => response.data),

    /**
     * GET /api/predictions
     *
     * Get prediction history.
     */
    getHistory: (params = {}) =>
        api
            .get("/predictions", { params })
            .then((response) => response.data),
};


// ============================================================
// DASHBOARD SERVICES
// ============================================================

export const dashboardService = {

    /**
     * GET /api/dashboard
     */
    getDashboard: () =>
        api
            .get("/dashboard")
            .then((response) => response.data),
};


// ============================================================
// PROFILE SERVICES
// ============================================================

export const profileService = {

    /**
     * GET /api/profile
     */
    getProfile: () =>
        api
            .get("/profile")
            .then((response) => response.data),

    /**
     * PUT /api/profile
     */
    updateProfile: (updates) => {

        const isFormData =
            updates instanceof FormData;

        return api
            .put("/profile", updates, {
                headers: isFormData
                    ? {
                        "Content-Type":
                            "multipart/form-data",
                    }
                    : {},
            })
            .then((response) => response.data);
    },

    /**
     * PUT /api/profile/password
     */
    changePassword: (data) =>
        api
            .put("/profile/password", data)
            .then((response) => response.data),
};


// ============================================================
// ADMIN SERVICES
// ============================================================

export const adminService = {

    /**
     * GET /api/admin/claims
     */
    getAllClaims: (params = {}) =>
        api
            .get("/admin/claims", { params })
            .then((response) => response.data),

    /**
     * GET /api/admin/users
     */
    getAllUsers: (params = {}) =>
        api
            .get("/admin/users", { params })
            .then((response) => response.data),

    /**
     * GET /api/admin/stats
     */
    getStats: () =>
        api
            .get("/admin/stats")
            .then((response) => response.data),

    getDashboard: () =>
        api
            .get("/admin/stats")
            .then((response) => response.data),

    /**
     * PUT /api/admin/claims/:id/approve
     */
    approveClaim: (claimId) =>
        api
            .put(
                `/admin/claims/${claimId}/approve`
            )
            .then((response) => response.data),

    /**
     * PUT /api/admin/claims/:id/reject
     */
    rejectClaim: (claimId, reason) =>
        api
            .put(
                `/admin/claims/${claimId}/reject`,
                { reason }
            )
            .then((response) => response.data),
};


// ============================================================
// AI SERVICES
// ============================================================

export const aiService = {

    /**
     * POST /api/predictions/:claimId
     *
     * Run AI fraud analysis.
     */
    analyzeClaim: (claimId) =>
        api
            .post(`/predictions/${claimId}`)
            .then((response) => response.data),

    /**
     * GET /api/predictions
     */
    getHistory: (params = {}) =>
        api
            .get("/predictions", { params })
            .then((response) => response.data),

    /**
     * GET /api/analytics
     */
    getAnalytics: () =>
        api
            .get("/analytics")
            .then((response) => response.data),

    /**
     * GET /api/model-info
     */
    getModelInfo: () =>
        api
            .get("/model-info")
            .then((response) => response.data),

    /**
     * POST /api/retrain-model
     *
     * Admin only.
     */
    retrainModel: () =>
        api
            .post("/retrain-model")
            .then((response) => response.data),

    /**
     * GET /api/reports
     */
    getReports: () =>
        api
            .get("/reports")
            .then((response) => response.data),
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;