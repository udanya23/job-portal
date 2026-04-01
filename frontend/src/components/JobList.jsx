import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../api/axiosInstance";

const EXP_OPTIONS = [
  { label: "Any Experience", value: "" },
  { label: "Fresher (0–1 yr)", value: "0-1" },
  { label: "1–3 Years", value: "1-3" },
  { label: "3–5 Years", value: "3-5" },
  { label: "5+ Years", value: "5+" },
];

const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const expLabel = (exp) => ({ "0-1": "Fresher", "1-3": "1–3 yrs", "3-5": "3–5 yrs", "5+": "5+ yrs" }[exp] || "Any");

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700",
];
const avatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const inputCls = "w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 font-medium px-3.5 py-2.5 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/40 transition-all";

const JobList = () => {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [appliedKw, setAppliedKw] = useState(searchParams.get("q") || "");
  const [appliedLoc, setAppliedLoc] = useState("");
  const [appliedExp, setAppliedExp] = useState("");
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expDropOpen, setExpDropOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const expDropRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isRecruiter = currentUser?.role === "recruiter";

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setKeyword(q); setAppliedKw(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = axios.get("/jobs");
    const fetchApps = currentUser?.role === "jobseeker" ? axios.get("/applications/my-applications") : Promise.resolve({ data: [] });
    const fetchSaved = currentUser?.role === "jobseeker" ? axios.get("/jobs/saved") : Promise.resolve({ data: [] });
    Promise.all([fetchJobs, fetchApps, fetchSaved])
      .then(([jRes, aRes, sRes]) => {
        setJobs(jRes.data);
        if (currentUser?.role === "jobseeker") {
          setMyApplications(aRes.data);
          setSavedJobs(sRes.data.map(j => typeof j === "object" ? j._id : j));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => { if (expDropRef.current && !expDropRef.current.contains(e.target)) setExpDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSave = async (jobId, e) => {
    e.preventDefault(); e.stopPropagation();
    try { const r = await axios.post(`/jobs/${jobId}/save`); setSavedJobs(r.data.savedJobs); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async (jobId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!window.confirm("Delete this job?")) return;
    setDeletingId(jobId);
    try { await axios.delete(`/jobs/${jobId}`); setJobs(p => p.filter(j => j._id !== jobId)); }
    catch (err) { alert(err.response?.data?.message || "Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const clearFilters = () => { setKeyword(""); setLocation(""); setExperience(""); setAppliedKw(""); setAppliedLoc(""); setAppliedExp(""); };
  const hasFilters = appliedKw || appliedLoc || appliedExp;

  const filtered = jobs.filter(job => {
    const kw = appliedKw.toLowerCase();
    const loc = appliedLoc.toLowerCase();
    return (
      (!kw || job.title.toLowerCase().includes(kw) || job.companyName.toLowerCase().includes(kw) || job.requirements?.some(r => r.toLowerCase().includes(kw))) &&
      (!loc || job.location.toLowerCase().includes(loc)) &&
      (!appliedExp || job.experience === appliedExp)
    );
  });

  if (loading) return (
    <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" />
    </div>
  );

  const selectedExpLabel = EXP_OPTIONS.find(o => o.value === experience)?.label || "Experience Level";

  return (
    <div className="min-h-screen bg-[#eef4f0]">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{hasFilters ? "Search Results" : "Recommended Jobs"}</h1>
              <p className="text-sm text-slate-400 mt-0.5"><span className="text-slate-700 font-semibold">{filtered.length}</span> {filtered.length === 1 ? "result" : "results"}</p>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs font-semibold text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg bg-white transition-colors">
                Clear ×
              </button>
            )}
          </div>

          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {appliedKw && (
                <button onClick={() => { setKeyword(""); setAppliedKw(""); }}
                   className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a5c40] text-white text-xs font-semibold rounded-lg hover:bg-[#144d35]">
                  🔍 {appliedKw} <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              {appliedLoc && (
                <button onClick={() => { setLocation(""); setAppliedLoc(""); }}
                   className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a5c40] text-white text-xs font-semibold rounded-lg hover:bg-[#144d35]">
                  📍 {appliedLoc} <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              {appliedExp && (
                <button onClick={() => { setExperience(""); setAppliedExp(""); }}
                   className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a5c40] text-white text-xs font-semibold rounded-lg hover:bg-[#144d35]">
                  💼 {expLabel(appliedExp)} <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {filtered.length > 0 ? filtered.map((job, idx) => {
              const hasApplied = !isRecruiter && myApplications.some(a => (a.job?._id || a.job) === job._id);
              const isSaved = savedJobs.includes(job._id);
              const isOwner = isRecruiter && job.recruiter?._id === currentUser?.id;
              const aColor = avatarColor(job.companyName);
              return (
                <Link to={`/jobs/${job._id}`} key={job._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4 hover:border-slate-300 hover:shadow-md transition-all duration-150 block group anim-slide-up"
                  style={{ animationDelay: `${idx * 35}ms` }}>
                  <div className={`w-12 h-12 rounded-xl font-bold text-lg flex items-center justify-center shrink-0 ${aColor}`}>
                    {job.companyName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#1a5c40] transition-colors truncate">{job.title}</h3>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{job.companyName}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!isRecruiter && (
                          <button onClick={e => handleSave(job._id, e)}
                            className={`p-2 rounded-lg border transition-all ${isSaved ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-slate-200 text-slate-300 hover:text-rose-500 hover:border-rose-200"}`}>
                            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                          </button>
                        )}
                        {isOwner && (
                          <button onClick={e => handleDelete(job._id, e)} disabled={deletingId === job._id}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-300 hover:text-rose-500 hover:border-rose-200 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {expLabel(job.experience)}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {job.salary}
                        </span>
                      )}
                      <span className="text-xs font-medium text-slate-400 ml-auto">{timeAgo(job.createdAt)}</span>
                    </div>

                    {job.requirements?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.requirements.slice(0, 5).map((r, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[11px] font-medium border border-slate-100">{r}</span>
                        ))}
                        {job.requirements.length > 5 && <span className="text-[11px] text-slate-400">+{job.requirements.length - 5} more</span>}
                      </div>
                    )}

                    {hasApplied && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e8f5ee] text-[#1a5c40] border border-[#b2d8c4]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                          Applied
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            }) : (
              <div className="py-24 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-slate-400 font-semibold mb-2">No results found</p>
                <button onClick={clearFilters} className="text-xs font-semibold text-[#1a5c40] hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-800">Filter Jobs</h2>
                <button onClick={clearFilters} className="text-xs font-semibold text-slate-400 hover:text-[#1a5c40] transition-colors uppercase tracking-wider">Reset</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Job Role</label>
                  <input type="text" placeholder="e.g. Frontend Developer" value={keyword} onChange={e => setKeyword(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Location</label>
                  <input type="text" placeholder="e.g. Remote, Mumbai" value={location} onChange={e => setLocation(e.target.value)} className={inputCls} />
                </div>
                <div ref={expDropRef}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Experience</label>
                  <div className="relative">
                    <button type="button" onClick={() => setExpDropOpen(!expDropOpen)}
                      className={`${inputCls} flex items-center justify-between cursor-pointer`}>
                      <span className="text-slate-700 font-semibold text-sm">{selectedExpLabel}</span>
                      <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expDropOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expDropOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 anim-slide-down">
                        {EXP_OPTIONS.map(opt => (
                          <button key={opt.value} type="button"
                            onClick={() => { setExperience(opt.value); setExpDropOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${experience === opt.value ? "text-[#1a5c40] bg-[#e8f5ee] font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => { setAppliedKw(keyword); setAppliedLoc(location); setAppliedExp(experience); }}
                  className="w-full flex items-center justify-center py-2.5 bg-[#1a5c40] text-white text-sm font-semibold rounded-lg hover:bg-[#144d35] transition-colors">
                  Search Jobs
                </button>
              </div>
            </div>

            <div className="bg-[#1a5c40] rounded-xl p-5 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1.5">Pro Tip</p>
              <p className="text-sm font-semibold leading-relaxed text-emerald-100">Keep your profile updated to get more relevant job recommendations.</p>
              <Link to="/profile" className="inline-block mt-3 text-xs font-bold bg-white text-[#1a5c40] px-3.5 py-2 rounded-lg hover:shadow-md transition-all">
                Update Profile
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobList;
