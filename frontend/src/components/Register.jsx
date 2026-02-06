import { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [role, setRole] = useState('jobseeker');
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        name: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
        // Job Seeker fields
        address: '',
        gender: '',
        // Recruiter fields
        companyName: '',
        companyAddress: ''
    });

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const API_URL = 'http://localhost:5000/api/auth';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        // Reset verification state when role changes
        setOtpSent(false);
        setOtpVerified(false);
        setFormData({
            ...formData,
            otp: ''
        });
    };

    // Helper function to display messages with auto-dismiss
    const showMessage = (text, type) => {
        setMessage({ text, type });
        // Auto-dismiss after 5 seconds
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            showMessage('Please enter your email', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/send-otp`, {
                email: formData.email,
                role: role
            });

            setOtpSent(true);
            showMessage(response.data.message, 'success');
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            showMessage('Please enter the OTP', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/verify-otp`, {
                email: formData.email,
                otp: formData.otp,
                role: role
            });

            setOtpVerified(true);
            showMessage(response.data.message, 'success');
        } catch (error) {
            showMessage(error.response?.data?.message || 'Verification failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Common validation
        if (!formData.name || !formData.password || !formData.confirmPassword || !formData.mobileNumber) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Role-specific validation
        if (role === 'jobseeker' && (!formData.address || !formData.gender)) {
            showMessage('Please fill in address and gender', 'error');
            return;
        }

        // Duplicate validation logic - recruiter validation handled in payload section
        // if(role === 'recruiter' && (!formData.address || !formData.gender)){
        //     showMessage('Please fill in address and gender','error');
        //     return;
        // }

        if (formData.password !== formData.confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        if (formData.password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                role: role,
                name: formData.name,
                mobileNumber: formData.mobileNumber
            };

            // Add role-specific fields
            if (role === 'jobseeker') {
                payload.address = formData.address;
                payload.gender = formData.gender;
            } else {
                payload.companyName = formData.companyName;
                payload.companyAddress = formData.companyAddress;
            }

            const response = await axios.post(`${API_URL}/register`, payload);

            showMessage(response.data.message + ' - Redirecting...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            showMessage(error.response?.data?.message || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                    User Registration
                </h1>
                <p className="text-gray-600 text-center mb-8 text-sm">
                    Create your account to get started
                </p>

                {/* Role Selection */}
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Your Role *
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="jobseeker"
                                checked={role === 'jobseeker'}
                                onChange={handleRoleChange}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-gray-700 font-medium">Job Seeker</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="recruiter"
                                checked={role === 'recruiter'}
                                onChange={handleRoleChange}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-gray-700 font-medium">Recruiter</span>
                        </label>
                    </div>
                </div>

                {/* Message Display - Success/Error notifications */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form>
                    {/* Email Verification Section */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-indigo-600 mb-5">
                            Email Verification
                        </h3>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="flex gap-3 flex-col sm:flex-row">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={otpVerified}
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={loading || otpVerified}
                                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {loading && !otpSent ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                                </button>
                            </div>
                        </div>

                        {otpSent && !otpVerified && (
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP *
                                </label>
                                <div className="flex gap-3 flex-col sm:flex-row">
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        placeholder="Enter 5-digit OTP"
                                        maxLength="5"
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOTP}
                                        disabled={loading}
                                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                </div>
                                {/* OTP validity reminder */}
                                <small className="block mt-2 text-gray-600 text-xs">
                                    Check your email for the OTP (valid for 10 minutes)
                                </small>
                            </div>
                        )}

                        {otpVerified && (
                            <div className="bg-green-100 border-2 border-green-500 text-green-800 px-4 py-3 rounded-lg text-center font-semibold">
                                ✓ Email Verified Successfully
                            </div>
                        )}
                    </div>

                    {/* Personal Information Section */}
                    <div className={`p-6 bg-gray-50 rounded-xl ${!otpVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="text-lg font-semibold text-indigo-600 mb-5">
                            {role === 'jobseeker' ? 'Personal Information' : 'Company Information'}
                        </h3>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {role === 'jobseeker' ? 'Full Name *' : 'Contact Person Name *'}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!otpVerified}
                                placeholder={role === 'jobseeker' ? 'Enter your full name' : 'Enter contact person name'}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={!otpVerified}
                                    placeholder="Minimum 6 characters"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={!otpVerified}
                                    placeholder="Re-enter password"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number *
                            </label>
                            <input
                                type="tel"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                disabled={!otpVerified}
                                placeholder="Enter mobile number"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Role-specific fields */}
                        {role === 'jobseeker' ? (
                            <>
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={!otpVerified}
                                        placeholder="Enter your address"
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={!otpVerified}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        disabled={!otpVerified}
                                        placeholder="Enter company name"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Address *
                                    </label>
                                    <textarea
                                        name="companyAddress"
                                        value={formData.companyAddress}
                                        onChange={handleChange}
                                        disabled={!otpVerified}
                                        placeholder="Enter company address"
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            onClick={handleRegister}
                            disabled={!otpVerified || loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6 text-gray-600 text-sm">
                    Already have an account?{' '}
                    <a href="/login" className="text-indigo-600 font-semibold hover:underline">
                        Login here
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Register;
