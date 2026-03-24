import { useState, createContext, useContext } from "react"
import axiosInstance from "./api/axiosInstance"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("user")
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    })

    async function login(data) {
        // Clear any existing session (cookie) before storing new credentials.
        // This prevents stale refresh-token cookies from a previous account
        // (e.g. job seeker) from being used when a different account (e.g. recruiter) logs in.
        try {
            await axiosInstance.post("/auth/logout")
        } catch {
            // Ignore — if there was no session to clear, that's fine
        }
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
    }

    async function logout() {
        try {
            await axiosInstance.post("/auth/logout")
        } catch (err) {
            // Even if the request fails, clear local state
            console.log("Logout request error:", err.message)
        }
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// Convenience hook
export const useAuth = () => useContext(AuthContext)
