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
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => { await logout(); navigate("/"); };
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(`/jobs?q=${encodeURIComponent(q)}&filter=1`);
    setSearchQuery("");
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const isActive = (path) => location.pathname === path;
  const linkCls = (path) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
      isActive(path) ? "text-[#1a5c40] bg-[#e8f5ee] font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <nav
      className={`sticky top-0 z-50 bg-white/95 border-b border-slate-200 transition-shadow duration-200 ${scrolled ? "shadow-md" : ""}`}
      style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center gap-4 h-[60px]">

        {/* Logo */}
        <Link to={user ? "/home" : "/"} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 bg-[#1a5c40] rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-slate-900 tracking-tight">CareerLink</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-0.5 ml-2">
          {!user && (
            <>
              <a href="/#categories" className="text-sm font-medium text-slate-500 px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">Categories</a>
              <a href="/#faqs" className="text-sm font-medium text-slate-500 px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">FAQs</a>
            </>
          )}
          {user && <Link to="/home" className={linkCls("/home")}>Dashboard</Link>}
          {user?.role === "jobseeker" && (
            <>
              <Link to="/my-applications" className={linkCls("/my-applications")}>Applications</Link>
              <Link to="/saved-jobs" className={linkCls("/saved-jobs")}>Saved</Link>
            </>
          )}
          {user?.role === "recruiter" && (
            <>
              <Link to="/post-job" className={linkCls("/post-job")}>Post Job</Link>
              <Link to="/applicants" className={linkCls("/applicants")}>Applicants</Link>
              <Link to="/interviews" className={linkCls("/interviews")}>Interviews</Link>
            </>
          )}
          <Link to="/jobs" className={linkCls("/jobs")}>Explore Jobs</Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[280px] ml-auto">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium placeholder:text-slate-400 text-slate-900 outline-none focus:border-[#1a5c40] focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Notifications />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#1a5c40] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                    <span className="text-[10px] text-[#1a5c40] font-medium capitalize mt-0.5">{user.role}</span>
                  </div>
                  <svg className={`w-3 h-3 text-slate-400 transition-transform ml-0.5 ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 py-1.5 z-50 anim-slide-down">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <div className="my-1 mx-2 border-t border-slate-100" />
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">Sign in</Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1a5c40] text-white text-xs font-semibold rounded-lg hover:bg-[#144d35] transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
