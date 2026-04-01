import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage("");
        try {
            await axios.post("/auth/forgot-password", { email });
            setStep(2);
            setMessage("OTP sent to your email!");
        } catch (err) { setMessage(err.response?.data?.message || "Failed to send OTP."); }
        finally { setLoading(false); }
    };

    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage("");
        try {
            await axios.post("/auth/reset-password", { email, otp, newPassword });
            setMessage("Password reset successful! Redirecting...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) { setMessage(err.response?.data?.message || "Reset failed."); }
        finally { setLoading(false); }
    };

    const inputCls = "w-full bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 px-4 py-3 outline-none focus:border-[#1a5c40] focus:ring-4 focus:ring-[#b2d8c4]/30 transition-all";

    return (
        <div className="min-h-screen bg-[#eef4f0] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-[#1a5c40] rounded-xl flex items-center justify-center shadow-lg shadow-[#1a5c40]/10">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">CareerLink</span>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 anim-slide-up">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h2>
                    <p className="text-sm font-bold text-slate-400 mb-8">
                        {step === 1 ? "Enter your email to receive a verification code." : "Set your new account password below."}
                    </p>

                    {message && (
                        <div className={`p-4 rounded-xl text-xs font-bold mb-6 border ${message.includes("success") || message.includes("OTP sent") ? "bg-[#e8f5ee] text-[#1a5c40] border-[#b2d8c4]" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                            {message}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@company.com" className={inputCls} />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 text-white text-sm font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50">
                                {loading ? "Sending..." : "Send Verification Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyAndReset} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Verification Code</label>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="5-digit OTP" maxLength={5} className={`${inputCls} text-center tracking-[0.5em]`} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="••••••••" className={inputCls} />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 text-white text-sm font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50">
                                {loading ? "Resetting..." : "Save New Password"}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <Link to="/login" className="text-sm font-bold text-[#1a5c40] hover:text-[#144d35] transition-colors">
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
