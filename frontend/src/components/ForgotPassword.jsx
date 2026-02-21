import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [data, setData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
        role: ''
    });

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post("/auth/forgot-password", { email: data.email });
            setData({ ...data, role: response.data.role });
            setStep(2);
            showMessage("OTP sent to your email", "success");
        } catch (err) {
            showMessage(err.response?.data?.message || "Failed to send OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post("/auth/verify-reset-otp", {
                email: data.email,
                otp: data.otp,
                role: data.role
            });
            setStep(3);
            showMessage("OTP verified successfully", "success");
        } catch (err) {
            showMessage(err.response?.data?.message || "Invalid OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (data.newPassword !== data.confirmPassword) {
            showMessage("Passwords do not match", "error");
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.post("/auth/reset-password", {
                email: data.email,
                otp: data.otp,
                newPassword: data.newPassword,
                role: data.role
            });
            showMessage("Password reset successful! Redirecting...", "success");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            showMessage(err.response?.data?.message || "Failed to reset password", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-6 font-sans">
            {/* Header */}
            <div className="mb-10 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">CareerLink</span>
            </div>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-8 md:p-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {step === 1 && "Reset Password"}
                        {step === 2 && "Verify Identity"}
                        {step === 3 && "New Password"}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {step === 1 && "Enter your email to receive a verification code."}
                        {step === 2 && `Enter the 5-digit code sent to ${data.email}`}
                        {step === 3 && "Choose a strong password for your account."}
                    </p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                        {message.text}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                placeholder="name@company.com"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-lg shadow-indigo-100"
                        >
                            {loading ? "Sending..." : "Continue"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Verification Code</label>
                            <input
                                type="text"
                                required
                                maxLength="5"
                                value={data.otp}
                                onChange={(e) => setData({ ...data, otp: e.target.value })}
                                placeholder="5-digit code"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-center tracking-[0.5em] font-black text-2xl"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-lg shadow-indigo-100"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Back to Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={data.newPassword}
                                    onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={data.confirmPassword}
                                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-lg shadow-indigo-100"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-8 border-t border-slate-100 text-center text-sm">
                    <Link to="/" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
