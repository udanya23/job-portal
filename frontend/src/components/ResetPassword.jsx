import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const { email, otp, role } = location.state || {}

    async function resetPassword(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            setLoading(false)
            return
        }

        try {
            await axiosInstance.post("/auth/reset-password", {
                email,
                otp,
                newPassword,
                role
            })
            alert("Password reset successful! You can now login.")
            navigate("/")
        } catch (err) {
            console.log("Error while resetting password:", err)
            setError(err.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
            <div className="bg-white border border-gray-300 rounded p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Reset Password</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={resetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
