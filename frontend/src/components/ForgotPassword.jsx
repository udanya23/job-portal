import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

// export default function ForgotPassword() {
//     const [email, setEmail] = useState()
//     const navigate = useNavigate()

//     async function sendOtp(e) {
//         e.preventDefault()
//         await API.post("/forgot-password", { email })
//             .then(res => {
//                 alert("OTP send to your email")
//                 navigate("/verify-reset", { state: email })
//             })
//             .catch(err => {
//                 console.log("error while sending otp", err)
//             })

//     }
//     return (
//         <div>
//             <form onSubmit={sendOtp}>
//                 <input type="email"
//                     placeholder='Enter your email'
//                     name='email'
//                     onChange={(e) => setEmail(e.target.value)} />
//                 <button>Send OTP</button>
//             </form>
//         </div>
//     )
// }

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    // const [error, setError] = useState('')
    const navigate = useNavigate()

    async function sendOtp(e) {
        e.preventDefault()
        setLoading(true)
        // setError('')

        try {
            const response = await axiosInstance.post("/auth/forgot-password", { email })
            alert("OTP sent to your email")
            navigate("/verify-reset", { state: { email, role: response.data.role } })
        } catch (err) {
            console.log("Error while sending OTP:", err)
            // setError(err.response?.data?.message || "Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
            <div className="bg-white border border-gray-300 rounded p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Forgot Password</h2>

                {/* {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )} */}

                <form onSubmit={sendOtp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            required
                            className="w-full p-2 border border-gray-300 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>

                    <div className="text-center mt-4">
                        <a href="/" className="text-sm text-blue-600 hover:underline">
                            Back to Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}
