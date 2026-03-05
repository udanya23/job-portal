import { useState } from 'react';
import { Link } from 'react-router-dom';
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
        address: '',
        gender: '',
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

    const handleRoleSelect = (selectedRole) => {
        if (otpVerified) return; // Prevent role change after verification
        setRole(selectedRole);
        setOtpSent(false);
        setOtpVerified(false);
        setFormData({ ...formData, otp: '' });
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
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

        if (!formData.name || !formData.password || !formData.confirmPassword || !formData.mobileNumber) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (role === 'jobseeker' && (!formData.address || !formData.gender)) {
            showMessage('Please fill in address and gender', 'error');
            return;
        }

        if (role === 'recruiter' && (!formData.companyName || !formData.companyAddress)) {
            showMessage('Please fill in company details', 'error');
            return;
        }

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
                mobileNumber: formData.mobileNumber,
                ...(role === 'jobseeker'
                    ? { address: formData.address, gender: formData.gender }
                    : { companyName: formData.companyName, companyAddress: formData.companyAddress }
                )
            };

            const response = await axios.post(`${API_URL}/register`, payload);
            showMessage(response.data.message + ' - Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            showMessage(error.response?.data?.message || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-6 font-sans">
            <div className="max-w-xl w-full space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-slate-200">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-4">Create your account</h1>
                    <p className="text-slate-500 text-sm">Join the professional network for future-ready talent</p>
                </div>

                <div className="clean-card p-10 bg-white">
                    {/* Progress Indicator (Subtle) */}
                    <div className="flex gap-2 mb-10">
                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${!otpVerified ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${otpSent && !otpVerified ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${otpVerified ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                    </div>

                    {message.text && (
                        <div className={`mb-8 p-4 rounded-xl text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                        {/* Role Selection */}
                        {!otpVerified && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Account Purpose</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect('jobseeker')}
                                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${role === 'jobseeker' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                    >
                                        Job Seeker
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect('recruiter')}
                                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${role === 'recruiter' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                    >
                                        Recruiter
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Email Verification */}
                        <div className={`space-y-4 ${otpVerified ? 'opacity-30 pointer-events-none' : ''}`}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Identification</label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={otpVerified}
                                        placeholder="professional@email.com"
                                        className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium disabled:opacity-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={loading || otpVerified}
                                        className="px-6 py-3.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {otpSent ? 'Resend' : 'Send'}
                                    </button>
                                </div>
                            </div>

                            {otpSent && !otpVerified && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Verify OTP</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="otp"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            placeholder="5-digit code"
                                            maxLength="5"
                                            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all tracking-[0.5em] text-center font-bold"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyOTP}
                                            disabled={loading}
                                            className="px-8 py-3.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-all uppercase tracking-widest"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Full Profile */}
                        {otpVerified && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{role === 'jobseeker' ? 'Identity' : 'Company Identity'}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={role === 'jobseeker' ? "Your full legal name" : "Your professional name"}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Mobile Access</label>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        placeholder="+91 00000 00000"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all font-medium"
                                    />
                                </div>

                                {role === 'jobseeker' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Location</label>
                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="City, State, Country"
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all font-semibold text-slate-700"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Active Organization</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                placeholder="Company Name Ltd."
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">HQ Address</label>
                                            <textarea
                                                name="companyAddress"
                                                value={formData.companyAddress}
                                                onChange={handleChange}
                                                placeholder="Corporate headquarters address..."
                                                rows="2"
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all resize-none font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
                                >
                                    {loading ? 'Processing...' : 'Complete Registration'}
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already a member?{' '}
                            <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                    CareerLink Professional · {new Date().getFullYear()}
                </p>
            </div>
        </div>

    );
};

export default Register;
