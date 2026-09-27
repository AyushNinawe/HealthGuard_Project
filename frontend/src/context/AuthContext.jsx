/**
 * AuthContext — global authentication state
 *
 * Provides:
 * - user
 * - token
 * - isAuthenticated
 * - isLoading
 * - login
 * - logout
 * - updateUser
 */

import {
    createContext,
    useContext,
    useReducer,
    useEffect,
} from "react";

import { authService } from "../services/api";
import {
    decodeJwtPayload,
    isTokenExpired,
} from "../utils/jwt";

const AuthContext = createContext(null);

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
};

// ============================================================
// REDUCER
// ============================================================

function authReducer(state, action) {
    switch (action.type) {

        case "HYDRATE":
        case "LOGIN":
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };

        case "LOGOUT":
            return {
                ...initialState,
                isLoading: false,
            };

        case "UPDATE_USER":
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload,
                },
            };

        case "READY":
            return {
                ...state,
                isLoading: false,
            };

        default:
            return state;
    }
}

// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({ children }) {

    const [state, dispatch] = useReducer(
        authReducer,
        initialState
    );

    // ========================================================
    // RESTORE LOGIN SESSION
    // ========================================================

    useEffect(() => {

        const token = localStorage.getItem("jwt_token");

        if (!token) {
            dispatch({ type: "READY" });
            return;
        }

        // Check whether token is expired
        if (isTokenExpired(token)) {

            localStorage.removeItem("jwt_token");

            dispatch({
                type: "READY",
            });

            return;
        }

        // Decode JWT
        const decodedUser = decodeJwtPayload(token);

        if (!decodedUser) {

            localStorage.removeItem("jwt_token");

            dispatch({
                type: "READY",
            });

            return;
        }

        // Normalize user object
        const user = {
            id:
                decodedUser.user_id ||
                decodedUser.id ||
                decodedUser.sub,

            user_id:
                decodedUser.user_id ||
                decodedUser.id ||
                decodedUser.sub,

            name:
                decodedUser.name ||
                decodedUser.full_name ||
                "",

            full_name:
                decodedUser.full_name ||
                decodedUser.name ||
                "",

            email:
                decodedUser.email ||
                "",

            role:
                decodedUser.role ||
                "user",
        };

        dispatch({
            type: "HYDRATE",
            payload: {
                token,
                user,
            },
        });

    }, []);

    // ========================================================
    // LOGIN
    // ========================================================

    async function login(credentials) {

        try {

            const data = await authService.login(credentials);

            // -----------------------------------------------
            // Validate backend response
            // -----------------------------------------------

            if (!data?.token) {
                throw new Error(
                    "Login successful but JWT token was not returned."
                );
            }

            // -----------------------------------------------
            // Store token
            // -----------------------------------------------

            localStorage.setItem(
                "jwt_token",
                data.token
            );

            // -----------------------------------------------
            // Get user
            //
            // Backend may return user directly.
            // If not, decode it from JWT.
            // -----------------------------------------------

            let user = data.user;

            if (!user) {
                const decodedUser =
                    decodeJwtPayload(data.token);

                user = {
                    id:
                        decodedUser?.user_id ||
                        decodedUser?.id ||
                        decodedUser?.sub,

                    user_id:
                        decodedUser?.user_id ||
                        decodedUser?.id ||
                        decodedUser?.sub,

                    name:
                        decodedUser?.name ||
                        decodedUser?.full_name ||
                        "",

                    full_name:
                        decodedUser?.full_name ||
                        decodedUser?.name ||
                        "",

                    email:
                        decodedUser?.email ||
                        credentials.email,

                    role:
                        decodedUser?.role ||
                        "user",
                };
            }

            // -----------------------------------------------
            // Normalize user
            // -----------------------------------------------

            user = {
                ...user,

                id:
                    user.id ||
                    user.user_id ||
                    user.sub,

                user_id:
                    user.user_id ||
                    user.id ||
                    user.sub,

                name:
                    user.name ||
                    user.full_name ||
                    "",

                full_name:
                    user.full_name ||
                    user.name ||
                    "",

                email:
                    user.email ||
                    credentials.email,

                role:
                    user.role ||
                    "user",
            };

            // -----------------------------------------------
            // Update global state
            // -----------------------------------------------

            dispatch({
                type: "LOGIN",
                payload: {
                    token: data.token,
                    user,
                },
            });

            return {
                ...data,
                user,
            };

        } catch (error) {

            // Do NOT create fake/demo users.
            // Real backend authentication should handle login.

            console.error(
                "Login error:",
                error
            );

            throw error;
        }
    }

    // ========================================================
    // LOGOUT
    // ========================================================

    function logout() {

        localStorage.removeItem(
            "jwt_token"
        );

        dispatch({
            type: "LOGOUT",
        });
    }

    // ========================================================
    // UPDATE USER
    // ========================================================

    function updateUser(partialUser) {

        dispatch({
            type: "UPDATE_USER",
            payload: partialUser,
        });
    }

    // ========================================================
    // PROVIDER
    // ========================================================

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================
// useAuth HOOK
// ============================================================

export function useAuth() {

    const context = useContext(
        AuthContext
    );

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}

export default AuthContext;