import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../api/axiosInstance";

const EXPERIENCE_OPTIONS = [
    { label: "Any Experience", value: "" },
    { label: "Fresher (0–1 yr)", value: "0-1" },
    { label: "1–3 Years", value: "1-3" },
    { label: "3–5 Years", value: "3-5" },
    { label: "5+ Years", value: "5+" },
];

const timeAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const JobList = () => {
    const [searchParams] = useSearchParams();

    // Filtering states
    const [appliedKeyword, setAppliedKeyword] = useState(searchParams.get("q") || "");
    const [appliedLocation, setAppliedLocation] = useState("");
    const [appliedExperience, setAppliedExperience] = useState("");

    const [keyword, setKeyword] = useState(searchParams.get("q") || "");
    const [location, setLocation] = useState("");
    const [experience, setExperience] = useState("");

    // Data states
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
        setKeyword(q);
        setAppliedKeyword(q);
    }, [searchParams]);

    useEffect(() => {
        const fetchJobs = axios.get("/jobs");
        const fetchMyApps = currentUser?.role === "jobseeker"
            ? axios.get("/applications/my-applications")
            : Promise.resolve({ data: [] });
        const fetchSavedJobs = currentUser?.role === "jobseeker"
            ? axios.get("/jobs/saved")
            : Promise.resolve({ data: [] });

        Promise.all([fetchJobs, fetchMyApps, fetchSavedJobs])
            .then(([jobsRes, appsRes, savedRes]) => {
                setJobs(jobsRes.data);
                if (currentUser?.role === "jobseeker") {
                    setMyApplications(appsRes.data);
                    setSavedJobs(savedRes.data.map(j => typeof j === "object" ? j._id : j));
                }
            })
            .catch((err) => console.error("Failed to fetch data:", err))
            .finally(() => setLoading(false));
    }, [currentUser?.role]);

    useEffect(() => {
        const handler = (e) => {
            if (expDropRef.current && !expDropRef.current.contains(e.target)) {
                setExpDropOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSaveJob = async (jobId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await axios.post(`/jobs/${jobId}/save`);
            setSavedJobs(res.data.savedJobs);
        } catch (err) {
            console.error("Failed to save job:", err);
        }
    };

    const handleDelete = async (jobId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!window.confirm("Are you sure?")) return;
        setDeletingId(jobId);
        try {
            await axios.delete(`/jobs/${jobId}`);
            setJobs(prev => prev.filter(j => j._id !== jobId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setAppliedKeyword(keyword);
        setAppliedLocation(location);
        setAppliedExperience(experience);
    };

    const clearFilters = () => {
        setKeyword(""); setLocation(""); setExperience("");
        setAppliedKeyword(""); setAppliedLocation(""); setAppliedExperience("");
    };

    const hasFilters = appliedKeyword || appliedLocation || appliedExperience;

    const experienceLabel = (exp) => {
        const map = { "0-1": "Fresher", "1-3": "1–3 yrs", "3-5": "3–5 yrs", "5+": "5+ yrs" };
        return map[exp] || "Any Experience";
    };

    const filteredJobs = jobs.filter(job => {
        const kw = appliedKeyword.toLowerCase();
        const loc = appliedLocation.toLowerCase();
        const matchKw = !kw || job.title.toLowerCase().includes(kw) || job.companyName.toLowerCase().includes(kw) || job.requirements?.some(r => r.toLowerCase().includes(kw));
        const matchLoc = !loc || job.location.toLowerCase().includes(loc);
        const matchExp = !appliedExperience || job.experience === appliedExperience;
        return matchKw && matchLoc && matchExp;
    });

    const selectedExpLabel = EXPERIENCE_OPTIONS.find(o => o.value === experience)?.label || "Experience Level";

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">

                {/* 1. MAIN FEED (Left) */}
                <main className="flex-1 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recommended jobs for you</h1>
                            <p className="text-slate-400 text-sm mt-1 font-medium">
                                Showing <span className="text-slate-700 font-bold">{filteredJobs.length}</span> {filteredJobs.length === 1 ? "result" : "results"}
                                {hasFilters && ` for your search`}
                            </p>
                        </div>
                        {hasFilters && (
                            <button onClick={clearFilters}
                                className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg">
                                Clear all ×
                            </button>
                        )}
                    </div>

                    {/* Active filter chips */}
                    {hasFilters && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {appliedKeyword && (
                                <button onClick={() => { setKeyword(""); setAppliedKeyword(""); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    "{appliedKeyword}"
                                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                            {appliedLocation && (
                                <button onClick={() => { setLocation(""); setAppliedLocation(""); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {appliedLocation}
                                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                            {appliedExperience && (
                                <button onClick={() => { setExperience(""); setAppliedExperience(""); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {experienceLabel(appliedExperience)}
                                    <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job, index) => {
                                const hasApplied = !isRecruiter && myApplications.some(app => (app.job?._id || app.job) === job._id);
                                const isSaved = savedJobs.includes(job._id);
                                const isOwner = isRecruiter && job.recruiter?._id === currentUser?.id;

                                return (
                                    <Link
                                        to={`/jobs/${job._id}`}
                                        key={job._id}
                                        className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-200 hover:border-slate-400 hover:shadow-sm cursor-pointer block group animate-slide-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-5">
                                                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-bold text-slate-300 shrink-0">
                                                    {job.companyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-600 transition-colors">{job.title}</h3>
                                                    <p className="text-sm font-semibold text-slate-600 mb-4">{job.companyName}</p>

                                                    <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-4">
                                                        {/* Experience */}
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            {experienceLabel(job.experience)}
                                                        </div>
                                                        {/* Salary */}
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {job.salary || "Not disclosed"}
                                                        </div>
                                                        {/* Location */}
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {job.location}
                                                        </div>
                                                    </div>

                                                    {job.requirements?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-6">
                                                            {job.requirements.slice(0, 4).map((req, i) => (
                                                                <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100/60">
                                                                    {req}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                {!isRecruiter && (
                                                    <button
                                                        onClick={(e) => handleSaveJob(job._id, e)}
                                                        className={`p-2.5 rounded-xl transition-all border ${isSaved ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200" : "bg-white border-slate-100 text-slate-300 hover:text-rose-500"}`}
                                                    >
                                                        <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {hasApplied && (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold rounded-lg">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                        Applied
                                                    </span>
                                                )}
                                                {isOwner && (
                                                    <button
                                                        onClick={(e) => handleDelete(job._id, e)}
                                                        className="p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-auto">{timeAgo(job.createdAt)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="py-24 text-center bg-white rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">No results found for your criteria.</p>
                                <button onClick={clearFilters} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">Clear all filters</button>
                            </div>
                        )}
                    </div>
                </main>

                {/* 2. SIDEBAR (Right) */}
                <aside className="w-full lg:w-96">
                    <div className="bg-white border border-slate-200/60 rounded-xl p-6 sticky top-24">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-bold text-slate-800">Quick Scan</h2>
                            <button onClick={clearFilters} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Reset</button>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Job Role</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Frontend Developer"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white transition-all outline-none placeholder:text-slate-400 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Remote, Mumbai"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white transition-all outline-none placeholder:text-slate-400 font-medium"
                                />
                            </div>

                            <div className="space-y-2" ref={expDropRef}>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Experience Level</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setExpDropOpen(!expDropOpen)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left flex items-center justify-between font-bold text-slate-600 hover:border-indigo-500/30 transition-all"
                                    >
                                        {selectedExpLabel}
                                        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expDropOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {expDropOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden animate-slide-up">
                                            {EXPERIENCE_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => { setExperience(opt.value); setExpDropOpen(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-[11px] transition-colors ${experience === opt.value ? "text-indigo-600 bg-indigo-50 font-bold" : "text-slate-500 font-bold hover:bg-slate-50"}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-slate-700 transition-colors active:scale-[0.98] w-full mt-4">Update Results</button>
                        </form>

                        <div className="mt-10 p-5 bg-slate-900 rounded-xl text-white relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Pro Tip</h3>
                            <p className="text-sm font-semibold leading-relaxed">Keep your profile updated to get more relevant job recommendations.</p>
                            <Link to="/profile" className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest bg-white text-slate-900 px-4 py-2 rounded-lg hover:shadow-lg transition-all">Update Now</Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default JobList;
