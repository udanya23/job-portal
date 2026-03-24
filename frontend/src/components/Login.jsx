import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [role, setRole] = useState(''); // '' = auto-detect
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                ...(role ? { role } : {}), // only send role if explicitly selected
            };
            const response = await axiosInstance.post('/auth/login', payload);
            login(response.data);
            showMessage(response.data.message, 'success');
            setTimeout(() => navigate('/home'), 1000);
        } catch (error) {
            showMessage(error.response?.data?.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">CareerLink</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10 max-w-md w-full">
                <div className="mb-7">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h1>
                    <p className="text-slate-500 text-sm">Sign in to your account to continue.</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                        {message.type === 'success' ? (
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Sign in as</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: '', label: 'Auto-detect', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                                { value: 'jobseeker', label: 'Job Seeker', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                { value: 'recruiter', label: 'Recruiter', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setRole(opt.value)}
                                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all
                                        ${role === opt.value
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={opt.icon} />
                                    </svg>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {role === '' && (
                            <p className="mt-1.5 text-[11px] text-slate-400">
                                Auto-detect finds your account automatically. Select a role if you're registered as both.
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between mb-1.5">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-700 focus:ring-4 focus:ring-slate-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            `Sign in${role === 'jobseeker' ? ' as Job Seeker' : role === 'recruiter' ? ' as Recruiter' : ''}`
                        )}
                    </button>
                </form>

                {/* Register link */}
                <div className="relative mt-7">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-slate-400 font-medium">New to CareerLink?</span>
                    </div>
                </div>

                <div className="mt-5">
                    <Link
                        to="/register"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                        Create an account
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-400">
                © {new Date().getFullYear()} CareerLink. All rights reserved.
            </p>
        </div>
    );
};

export default Login;
