import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

export default function VerifyReset() {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const { email, role } = location.state || {}

    async function verifyOtp(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await axiosInstance.post("/auth/verify-reset-otp", { email, otp, role })
            alert("OTP verified successfully")
            navigate("/reset-password", { state: { email, otp, role } })
        } catch (err) {
            console.log("Error while verifying OTP:", err)
            setError(err.response?.data?.message || "Invalid OTP")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
            <div className="bg-white border border-gray-300 rounded p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify OTP</h2>

                <p className="text-sm text-gray-600 mb-4">
                    We've sent a 5-digit OTP to <strong>{email}</strong>
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={verifyOtp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            placeholder="Enter 5-digit OTP"
                            maxLength="5"
                            required
                            className="w-full p-2 border border-gray-300 rounded text-center text-2xl tracking-widest"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            </div>
        </div>
    )
}
