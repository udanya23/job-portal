import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Notifications from "./Notifications";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(`/jobs?q=${encodeURIComponent(q)}&filter=1`);
    setSearchQuery("");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors py-1.5 px-3 rounded-lg ${isActive(path)
      ? "text-indigo-600 bg-indigo-50 font-semibold"
      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center gap-4">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">CareerLink</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/home" className={navLinkClass("/home")}>
            Dashboard
          </Link>

          {user?.role === "jobseeker" && (
            <Link to="/my-applications" className={navLinkClass("/my-applications")}>
              Applications
            </Link>
          )}

          {user?.role === "recruiter" && (
            <Link to="/post-job" className={navLinkClass("/post-job")}>
              Post Job
            </Link>
          )}

          <Link to="/jobs" className={navLinkClass("/jobs")}>
            Explore Jobs
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
          <div className="relative w-full flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-200 shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          {user && <Notifications />}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-indigo-700 transition-colors">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                  <span className="text-[10px] text-indigo-500 font-medium capitalize mt-0.5">{user.role}</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-200/60 py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
