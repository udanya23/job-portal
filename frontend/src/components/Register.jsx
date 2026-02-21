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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6 font-sans">
            {/* Header */}
            <div className="mb-10 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">CareerLink</span>
            </div>

            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="md:flex">
                    {/* Sidebar/Stepper - Optional visual element */}
                    <div className="hidden md:block w-1/3 bg-slate-900 p-10 text-white">
                        <h2 className="text-xl font-bold mb-6">Join our platform</h2>
                        <ul className="space-y-8">
                            {[
                                { title: 'Account Type', desc: 'Choose your role', active: !otpVerified },
                                { title: 'Verification', desc: 'Email confirmation', active: otpSent && !otpVerified },
                                { title: 'Full Profile', desc: 'Personal details', active: otpVerified }
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step.active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 text-slate-500'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${step.active ? 'text-white' : 'text-slate-500'}`}>{step.title}</p>
                                        <p className="text-xs text-slate-500">{step.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {/* <div className="mt-20">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Join thousands of professionals and companies already using CareerLink to find their perfect match.
                            </p>
                        </div> */}
                    </div>

                    <div className="flex-1 p-8 md:p-12">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
                            <p className="text-slate-500 text-sm mt-1">Get started with your professional journey today.</p>
                        </div>

                        {/* Error/Success Messages */}
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                            {/* Step 1: Role Selection */}
                            {!otpVerified && (
                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-slate-700">I am a...</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('jobseeker')}
                                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${role === 'jobseeker' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${role === 'jobseeker' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <p className="font-bold text-slate-900">Job Seeker</p>
                                            <p className="text-xs text-slate-500 mt-1">Found your next big opportunity</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect('recruiter')}
                                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${role === 'recruiter' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${role === 'recruiter' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <p className="font-bold text-slate-900">Recruiter</p>
                                            <p className="text-xs text-slate-500 mt-1">Hire the best talent for your team</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Email Verification */}
                            <div className={`space-y-4 ${otpVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={otpVerified}
                                                placeholder="name@company.com"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            disabled={loading || otpVerified}
                                            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-colors whitespace-nowrap"
                                        >
                                            {otpSent ? 'Resend' : 'Send Code'}
                                        </button>
                                    </div>
                                </div>

                                {otpSent && !otpVerified && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Verification Code</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    name="otp"
                                                    value={formData.otp}
                                                    onChange={handleChange}
                                                    placeholder="5-digit code"
                                                    maxLength="5"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all tracking-widest text-center font-bold"
                                                />
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleVerifyOTP}
                                                disabled={loading}
                                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Full Profile */}
                            {otpVerified && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="col-span-full">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                {role === 'jobseeker' ? 'Full Name' : 'Contact Person Name'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="John Doe"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                                                />
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                                            />
                                        </div>

                                        <div className="col-span-full">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                                            <input
                                                type="tel"
                                                name="mobileNumber"
                                                value={formData.mobileNumber}
                                                onChange={handleChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                                            />
                                        </div>

                                        {role === 'jobseeker' ? (
                                            <>
                                                <div className="col-span-full">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                                                    <textarea
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        placeholder="Enter your full address"
                                                        rows="3"
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 resize-none"
                                                    />
                                                </div>
                                                <div className="col-span-full">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
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
                                                <div className="col-span-full">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                                                    <input
                                                        type="text"
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        placeholder="Acme Corp"
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                                                    />
                                                </div>
                                                <div className="col-span-full">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Address</label>
                                                    <textarea
                                                        name="companyAddress"
                                                        value={formData.companyAddress}
                                                        onChange={handleChange}
                                                        placeholder="Enter company headquarters address"
                                                        rows="3"
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 resize-none"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleRegister}
                                        disabled={loading}
                                        className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Creating account...</span>
                                            </>
                                        ) : 'Register'}
                                    </button>
                                </div>
                            )}
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-sm text-slate-500">
                &copy; {new Date().getFullYear()} CareerLink. All rights reserved.
            </p>
        </div>
    );
};

export default Register;
