import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// ============================================================
// AUTH
// ============================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// ============================================================
// USER PAGES
// ============================================================

import Dashboard from "./pages/Dashboard";
import SubmitClaim from "./pages/SubmitClaim";
import ClaimHistory from "./pages/ClaimHistory";
import ClaimDetails from "./pages/ClaimDetails";
import PredictionResult from "./pages/PredictionResult";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// ============================================================
// AI & ADVANCED MODULE PAGES
// ============================================================

import AIFraudDetection from "./pages/ai/AIFraudDetection";
import AIAnalytics from "./pages/ai/AIAnalytics";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Documents from "./pages/Documents";
import AdvancedSearch from "./pages/AdvancedSearch";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAITools from "./pages/admin/AdminAITools";

// ============================================================
// OTHER
// ============================================================

import NotFound from "./pages/NotFound";


function App() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <SettingsProvider>

                    <Routes>

                        {/* ==================================================
                            PUBLIC ROUTES
                        ================================================== */}

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />


                        {/* ==================================================
                            PROTECTED ROUTES
                        ================================================== */}

                        <Route element={<ProtectedRoute />}>

                            <Route element={<MainLayout />}>

                                {/* Dashboard */}
                                <Route
                                    path="/dashboard"
                                    element={<Dashboard />}
                                />

                                {/* Claims */}
                                <Route
                                    path="/claims"
                                    element={<ClaimHistory />}
                                />

                                {/* Create Claim */}
                                <Route
                                    path="/claims/new"
                                    element={<SubmitClaim />}
                                />
                                <Route
                                    path="/submit-claim"
                                    element={<SubmitClaim />}
                                />

                                {/* Claim Details */}
                                <Route
                                    path="/claims/:id"
                                    element={<ClaimDetails />}
                                />

                                {/* Fraud Prediction */}
                                <Route
                                    path="/claims/:id/prediction"
                                    element={<PredictionResult />}
                                />
                                <Route
                                    path="/ai/fraud-detection"
                                    element={<AIFraudDetection />}
                                />
                                <Route
                                    path="/ai/analytics"
                                    element={<AIAnalytics />}
                                />

                                {/* Documents, Reports, Notifications, Search */}
                                <Route
                                    path="/documents"
                                    element={<Documents />}
                                />
                                <Route
                                    path="/reports"
                                    element={<Reports />}
                                />
                                <Route
                                    path="/notifications"
                                    element={<Notifications />}
                                />
                                <Route
                                    path="/search"
                                    element={<AdvancedSearch />}
                                />

                                {/* Profile & Settings */}
                                <Route
                                    path="/profile"
                                    element={<Profile />}
                                />
                                <Route
                                    path="/settings"
                                    element={<Settings />}
                                />

                                {/* Admin Routes */}
                                <Route
                                    path="/admin"
                                    element={<AdminDashboard />}
                                />
                                <Route
                                    path="/admin/ai-tools"
                                    element={<AdminAITools />}
                                />

                            </Route>

                        </Route>


                        {/* ==================================================
                            DEFAULT ROUTE
                        ================================================== */}

                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            }
                        />


                        {/* ==================================================
                            404
                        ================================================== */}

                        <Route
                            path="*"
                            element={<NotFound />}
                        />

                    </Routes>

                </SettingsProvider>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;
