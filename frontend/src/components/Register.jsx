import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [role, setRole] = useState('jobseeker');
  const [formData, setFormData] = useState({
    email: '', otp: '', name: '', password: '', confirmPassword: '',
    mobileNumber: '', address: '', gender: '', companyName: '', companyAddress: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = 'http://localhost:5000/api/auth';
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleSelect = (r) => {
    if (otpVerified) return;
    setRole(r); setOtpSent(false); setOtpVerified(false);
    setFormData(f => ({ ...f, otp: '' }));
  };
  const showMessage = (text, type) => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: '' }), 5000); };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) { showMessage('Please enter your email', 'error'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/send-otp`, { email: formData.email, role });
      setOtpSent(true); showMessage(res.data.message, 'success');
    } catch (err) { showMessage(err.response?.data?.message || 'Failed to send OTP', 'error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) { showMessage('Please enter the OTP', 'error'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email: formData.email, otp: formData.otp, role });
      setOtpVerified(true); showMessage(res.data.message, 'success');
    } catch (err) { showMessage(err.response?.data?.message || 'Verification failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password || !formData.confirmPassword || !formData.mobileNumber) { showMessage('Please fill in all fields', 'error'); return; }
    if (role === 'jobseeker' && (!formData.address || !formData.gender)) { showMessage('Please fill in address and gender', 'error'); return; }
    if (role === 'recruiter' && (!formData.companyName || !formData.companyAddress)) { showMessage('Please fill in company details', 'error'); return; }
    if (formData.password !== formData.confirmPassword) { showMessage('Passwords do not match', 'error'); return; }
    if (formData.password.length < 6) { showMessage('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      const payload = {
        email: formData.email, password: formData.password, role, name: formData.name, mobileNumber: formData.mobileNumber,
        ...(role === 'jobseeker' ? { address: formData.address, gender: formData.gender } : { companyName: formData.companyName, companyAddress: formData.companyAddress })
      };
      const res = await axios.post(`${API_URL}/register`, payload);
      showMessage(res.data.message + ' — Redirecting to login...', 'success');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch (err) { showMessage(err.response?.data?.message || 'Registration failed', 'error'); }
    finally { setLoading(false); }
  };

  const step = !otpSent ? 1 : !otpVerified ? 2 : 3;
  const steps = ["Account Type", "Verify Email", "Profile"];
  const inputCls = "w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 font-medium px-3.5 py-2.5 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/40 transition-all";

  return (
    <div className="min-h-screen bg-[#eef4f0] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#1a5c40] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-[15px]">CareerLink</span>
        </div>
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Create your account</h1>
          <p className="text-sm text-slate-500">Join the professional network for future-ready talent</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((label, i) => {
            const s = i + 1;
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${s < step ? "bg-[#1a5c40] border-[#1a5c40] text-white" : s === step ? "bg-white border-[#1a5c40] text-[#1a5c40]" : "bg-white border-slate-200 text-slate-300"
                    }`}>
                    {s < step ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : s}
                  </div>
                  <span className={`text-[9px] font-semibold mt-1 ${s <= step ? "text-[#1a5c40]" : "text-slate-300"}`}>{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px flex-1 mb-4 mx-2 transition-colors ${s < step ? "bg-[#1a5c40]" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-7">
          {message.text && (
            <div className={`mb-5 p-3.5 rounded-xl text-sm font-medium border flex items-center gap-2 anim-slide-down ${message.type === 'success' ? 'bg-[#e8f5ee] text-[#1a5c40] border-[#b2d8c4]' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.type === 'success'
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              </svg>
              {message.text}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {/* Role */}
            {!otpVerified && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'jobseeker', label: 'Job Seeker', desc: 'Find my next role', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { value: 'recruiter', label: 'Recruiter', desc: 'Hire top talent', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => handleRoleSelect(opt.value)} disabled={otpVerified}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${role === opt.value ? 'bg-[#1a5c40] text-white border-[#1a5c40] shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        } disabled:opacity-50`}>
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={opt.icon} />
                      </svg>
                      <div className="text-left">
                        <p className="font-bold text-sm">{opt.label}</p>
                        <p className={`text-[11px] font-medium ${role === opt.value ? 'text-[#a8d4bc]' : 'text-slate-400'}`}>{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email + OTP */}
            <div className={otpVerified ? 'opacity-40 pointer-events-none select-none' : ''}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="flex gap-2">
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      disabled={otpVerified} placeholder="professional@email.com" className={`${inputCls} flex-1`} />
                    <button type="button" onClick={handleSendOTP} disabled={loading || otpVerified}
                     className="px-4 py-2.5 bg-[#e8f5ee] text-[#1a5c40] text-xs font-bold rounded-lg hover:bg-[#d4f0e0] transition-all disabled:opacity-40 shrink-0 border border-[#b2d8c4]">
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                </div>
                {otpSent && !otpVerified && (
                  <div className="anim-slide-down">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enter OTP</label>
                    <div className="flex gap-2">
                      <input type="text" name="otp" value={formData.otp} onChange={handleChange}
                        placeholder="5-digit code" maxLength="5" className={`${inputCls} flex-1 tracking-[0.4em] text-center font-bold`} />
                      <button type="button" onClick={handleVerifyOTP} disabled={loading}
                       className="px-5 py-2.5 bg-[#1a5c40] text-white text-xs font-semibold rounded-lg hover:bg-[#144d35] transition-colors shrink-0 disabled:opacity-50">
                        Verify
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">Check your inbox for the 5-digit code</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile form */}
            {otpVerified && (
              <div className="space-y-4 anim-slide-up">
                <div className="flex items-center gap-2 p-3 bg-[#e8f5ee] border border-[#b2d8c4] rounded-xl mb-1">
                  <svg className="w-4 h-4 text-[#1a5c40] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-semibold text-[#1a5c40]">Email verified successfully</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Your full name" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="+91 00000 00000" className={inputCls} />
                </div>
                {role === 'jobseeker' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                      <input name="address" value={formData.address} onChange={handleChange} placeholder="City, State" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Name</label>
                      <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name Ltd." className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Address</label>
                      <textarea name="companyAddress" value={formData.companyAddress} onChange={handleChange}
                        rows="2" placeholder="Corporate address..." className={`${inputCls} resize-none`} />
                    </div>
                  </div>
                )}
                <button type="button" onClick={handleRegister} disabled={loading}
                  className="w-full flex items-center justify-center py-2.5 bg-[#1a5c40] text-white text-sm font-semibold rounded-lg hover:bg-[#144d35] disabled:opacity-50 transition-colors mt-1">
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            )}
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">Already have an account?{' '}
              <Link to="/login" className="text-[#1a5c40] font-semibold hover:text-[#144d35] transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-[10px] font-medium text-slate-300 uppercase tracking-widest mt-6">CareerLink © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Register;
