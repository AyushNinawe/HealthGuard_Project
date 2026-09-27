import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";

/**
 * ProtectedRoute
 *
 * Protects routes that require authentication.
 *
 * Props:
 * - requiredRole: Optional role requirement, e.g. "admin"
 * - adminOnly: Optional boolean. If true, only admin users can access.
 */
export default function ProtectedRoute({
    requiredRole,
    adminOnly = false,
}) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // ------------------------------------------------------------
    // Loading
    // ------------------------------------------------------------
    if (isLoading) {
        return (
            <LoadingSpinner
                fullPage
                text="Loading..."
            />
        );
    }

    // ------------------------------------------------------------
    // Not authenticated
    // ------------------------------------------------------------
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // ------------------------------------------------------------
    // Admin-only route
    // ------------------------------------------------------------
    if (adminOnly && user?.role !== "admin") {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    // ------------------------------------------------------------
    // Required role route
    // ------------------------------------------------------------
    if (
        requiredRole &&
        user?.role !== requiredRole
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    // ------------------------------------------------------------
    // Authorized
    // ------------------------------------------------------------
    return <Outlet />;
}