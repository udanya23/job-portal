import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { showMessage('Please fill in all fields', 'error'); return; }
    setLoading(true);
    try {
      const payload = { email: formData.email, password: formData.password, ...(role ? { role } : {}) };
      const response = await axiosInstance.post('/auth/login', payload);
      login(response.data);
      showMessage(response.data.message, 'success');
      setTimeout(() => navigate('/home'), 900);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: '', label: 'Auto-detect', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { value: 'jobseeker', label: 'Job Seeker', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { value: 'recruiter', label: 'Recruiter', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 font-medium px-3.5 py-2.5 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/40 transition-all";

  return (
    <div className="min-h-screen bg-[#eef4f0] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#1a5c40] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-bold text-[15px]">CareerLink</span>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Your next great<br />opportunity awaits
          </h2>
          <p className="text-[#a8d4bc] text-base leading-relaxed">Join thousands of professionals who found their dream careers through CareerLink.</p>
          <div className="mt-10 space-y-3.5">
            {[
              { icon: '🎯', text: 'Smart job matching based on your profile' },
              { icon: '📊', text: 'Track applications in real-time' },
              { icon: '🔔', text: 'Instant alerts when recruiters respond' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-[#c5e8d4] text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-emerald-300/50 text-xs">© {new Date().getFullYear()} CareerLink</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[#1a5c40] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900">CareerLink</span>
        </div>

        <div className="w-full max-w-[400px] anim-fade-in">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to continue to your account</p>
          </div>

          {message.text && (
            <div className={`mb-5 flex items-start gap-2.5 p-3.5 rounded-xl text-sm font-medium border anim-slide-down ${message.type === 'success' ? 'bg-[#e8f5ee] text-[#1a5c40] border-[#b2d8c4]' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.type === 'success'
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              </svg>
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Sign in as</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${role === opt.value ? 'bg-[#1a5c40] text-white border-[#1a5c40] shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                      }`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={opt.icon} />
                    </svg>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@company.com" required className={inputCls} />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-[#1a5c40] hover:text-[#144d35] transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a5c40] text-white text-sm font-semibold rounded-lg hover:bg-[#144d35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm mt-1">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Signing in...</>
              ) : `Sign in${role === 'jobseeker' ? ' as Job Seeker' : role === 'recruiter' ? ' as Recruiter' : ''}`}
            </button>
          </form>

          <div className="relative mt-7 mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#eef4f0] px-3 text-slate-400 font-medium">New to CareerLink?</span></div>
          </div>

          <Link to="/register" className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
