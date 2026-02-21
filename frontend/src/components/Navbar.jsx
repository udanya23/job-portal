import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload(); // refresh auth state
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center py-4">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">CareerLink</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 md:gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/home"
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Dashboard
            </Link>

            {user?.role === "jobseeker" && (
              <Link
                to="/my-applications"
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Applications
              </Link>
            )}

            {user?.role === "recruiter" && (
              <Link
                to="/post-job"
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Post Job
              </Link>
            )}

            <Link
              to="/jobs"
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Explore Jobs
            </Link>

            <Link
              to="/profile"
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Profile
            </Link>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

          {/* User & Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 leading-none">{user.name}</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1 opacity-70">{user.role}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
