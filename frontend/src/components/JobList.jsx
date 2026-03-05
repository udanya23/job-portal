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

const JobList = () => {
    const [searchParams] = useSearchParams();

    // "applied" values — what's actually being filtered
    const [appliedKeyword, setAppliedKeyword] = useState(searchParams.get("q") || "");
    const [appliedLocation, setAppliedLocation] = useState("");
    const [appliedExperience, setAppliedExperience] = useState("");

    // "draft" values — live in the inputs
    const [keyword, setKeyword] = useState(searchParams.get("q") || "");
    const [location, setLocation] = useState("");
    const [experience, setExperience] = useState("");

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(!!searchParams.get("filter") || !!searchParams.get("q"));
    const [expDropOpen, setExpDropOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const expDropRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const isRecruiter = currentUser?.role === "recruiter";

    // Sync from URL when navigating via Navbar search
    useEffect(() => {
        const q = searchParams.get("q") || "";
        setKeyword(q);
        setAppliedKeyword(q);
        if (q) setFiltersOpen(true);
    }, [searchParams]);

    useEffect(() => {
        axios.get("/jobs")
            .then((res) => setJobs(res.data))
            .catch((err) => console.error("Failed to fetch jobs:", err))
            .finally(() => setLoading(false));
    }, []);

    // Close experience dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (expDropRef.current && !expDropRef.current.contains(e.target)) {
                setExpDropOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job post? This action cannot be undone.")) return;
        setDeletingId(jobId);
        try {
            await axios.delete(`/jobs/${jobId}`);
            setJobs(prev => prev.filter(j => j._id !== jobId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete job.");
        } finally {
            setDeletingId(null);
        }
    };

    // Apply search — commit draft → applied
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
        return map[exp] || "Any Exp";
    };

    const filteredJobs = jobs.filter(job => {
        const kw = appliedKeyword.toLowerCase();
        const loc = appliedLocation.toLowerCase();
        const matchKw = !kw || job.title.toLowerCase().includes(kw) || job.companyName.toLowerCase().includes(kw) || job.requirements?.some(r => r.toLowerCase().includes(kw));
        const matchLoc = !loc || job.location.toLowerCase().includes(loc);
        const matchExp = !appliedExperience || job.experience === appliedExperience;
        return matchKw && matchLoc && matchExp;
    });

    const selectedExpLabel = EXPERIENCE_OPTIONS.find(o => o.value === experience)?.label || "Experience";

    if (loading) return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Browse Jobs</h1>
                        <p className="text-slate-500 text-sm mt-1">Found {filteredJobs.length} opportunities for you</p>
                    </div>
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${filtersOpen || hasFilters ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {filtersOpen ? "Hide Filters" : "Show Filters"}
                        {hasFilters && !filtersOpen && (
                            <span className="w-2 h-2 rounded-full bg-rose-400 ml-1" />
                        )}
                    </button>
                </div>

                {/* ── FILTER BAR ── */}
                {filtersOpen && (
                    <form onSubmit={handleSearch} className="clean-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Keyword */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Keywords</label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Job title, company or skill..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-1.5" ref={expDropRef}>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Experience</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setExpDropOpen(!expDropOpen)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left flex items-center justify-between hover:border-slate-300 transition-colors font-medium text-slate-700"
                                >
                                    {selectedExpLabel}
                                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expDropOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {expDropOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                                        {EXPERIENCE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => { setExperience(opt.value); setExpDropOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${experience === opt.value ? "text-indigo-600 bg-indigo-50/50 font-bold" : "text-slate-600 font-medium"}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="City or remote..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm shadow-indigo-200"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2.5 text-slate-400 hover:text-rose-500 font-bold text-xs uppercase tracking-widest transition-all rounded-xl hover:bg-rose-50"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                )}

                {/* ── ACTIVE FILTER CHIPS ── */}
                {hasFilters && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active filters:</span>
                        {appliedKeyword && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                                🔍 {appliedKeyword}
                                <button onClick={() => { setKeyword(""); setAppliedKeyword(""); }} className="text-indigo-400 hover:text-indigo-600 ml-1">✕</button>
                            </span>
                        )}
                        {appliedLocation && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-100">
                                📍 {appliedLocation}
                                <button onClick={() => { setLocation(""); setAppliedLocation(""); }} className="text-teal-400 hover:text-teal-600 ml-1">✕</button>
                            </span>
                        )}
                        {appliedExperience && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg border border-violet-100">
                                🎓 {experienceLabel(appliedExperience)}
                                <button onClick={() => { setExperience(""); setAppliedExperience(""); }} className="text-violet-400 hover:text-violet-600 ml-1">✕</button>
                            </span>
                        )}
                    </div>
                )}

                {/* ── JOB CARDS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => {
                            const ms = Date.now() - new Date(job.createdAt).getTime();
                            const days = Math.floor(ms / 86400000);
                            const timeAgo = days === 0 ? "Today" : days === 1 ? "Yesterday" : days < 7 ? `${days}d ago` : `${Math.floor(days / 7)}w ago`;
                            const isOwner = isRecruiter && job.recruiter?._id === currentUser?.id;

                            return (
                                <div key={job._id} className="clean-card p-6 flex flex-col hover-card group relative">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                                                {job.companyName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors tracking-tight">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500">{job.companyName}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100/50">
                                                Full Time
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{timeAgo}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 mb-8">
                                        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                                            <span className="text-slate-300">📍</span> {job.location}
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-600">
                                            <span className="text-slate-300">💰</span> {job.salary || "Competitive"}
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                                            <span className="text-slate-300">💼</span> {job.jobType || "Remote"}
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                                            <span className="text-slate-300">🎓</span> {experienceLabel(job.experience)}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {job.requirements?.slice(0, 3).map((req, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                                                {req}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions row */}
                                    {isOwner ? (
                                        <div className="mt-auto flex gap-2">
                                            <Link
                                                to={`/jobs/${job._id}`}
                                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all text-center tracking-widest uppercase"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/jobs/${job._id}/edit`}
                                                className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all text-center tracking-widest uppercase shadow-lg shadow-slate-200"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                disabled={deletingId === job._id}
                                                className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all tracking-widest uppercase border border-rose-100 hover:border-rose-600 disabled:opacity-50"
                                            >
                                                {deletingId === job._id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to={`/jobs/${job._id}`}
                                            className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all text-center tracking-widest uppercase shadow-lg shadow-slate-200"
                                        >
                                            View Opportunity
                                        </Link>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-24 clean-card flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                            <p className="text-slate-500 text-sm mt-2 mb-8 max-w-xs mx-auto">Try refining your search keywords or location filters to see more results.</p>
                            <button onClick={clearFilters} className="btn-secondary">
                                Reset All Filters
                            </button>
                        </div>
                    )}
                </div>

            </div>

            <p className="mt-16 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                CareerLink Professional · {new Date().getFullYear()}
            </p>
        </div>
    );
};


export default JobList;
