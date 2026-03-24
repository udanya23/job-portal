import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchSavedJobs(); }, []);

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/jobs/saved");
            setSavedJobs(res.data);
        } catch (err) {
            console.error("Failed to fetch saved jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (jobId) => {
        try {
            await axios.post(`/jobs/${jobId}/save`);
            setSavedJobs(prev => prev.filter(job => job._id !== jobId));
        } catch (err) {
            console.error("Failed to unsave job:", err);
        }
    };

    const timeAgo = (date) => {
        const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days}d ago`;
        return `${Math.floor(days / 7)}w ago`;
    };

    const expLabel = (exp) => {
        const map = { "0-1": "Fresher", "1-3": "1–3 yrs", "3-5": "3–5 yrs", "5+": "5+ yrs" };
        return map[exp] || exp || "Any";
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Saved Opportunities</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} bookmarked
                        </p>
                    </div>
                    <Link to="/jobs" className="btn-primary flex items-center gap-2 w-fit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse More
                    </Link>
                </div>

                {savedJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedJobs.map((job) => (
                            <div key={job._id} className="clean-card p-5 flex flex-col gap-4 hover-card">
                                {/* Top */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Color-coded company initial */}
                                        {(() => {
                                            const COLORS = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];
                                            const c = COLORS[(job.companyName?.charCodeAt(0) || 0) % COLORS.length];
                                            return (
                                                <div className={`w-11 h-11 rounded-xl font-bold text-base flex items-center justify-center shrink-0 ${c}`}>
                                                    {job.companyName?.charAt(0).toUpperCase()}
                                                </div>
                                            );
                                        })()}
                                        <div className="min-w-0">
                                            <Link to={`/jobs/${job._id}`} className="font-bold text-slate-900 text-sm leading-tight hover:text-slate-600 transition-colors block truncate">
                                                {job.title}
                                            </Link>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">{job.companyName}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest shrink-0 pt-0.5">
                                        {timeAgo(job.createdAt)}
                                    </span>
                                </div>

                                {/* Meta row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {job.salary || "Competitive"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {expLabel(job.experience)}
                                    </span>
                                </div>

                                {/* Skills */}
                                {job.requirements?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.requirements.slice(0, 4).map((req, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wide">
                                                {req}
                                            </span>
                                        ))}
                                        {job.requirements.length > 4 && (
                                            <span className="px-2 py-0.5 text-slate-400 text-[10px] font-bold">+{job.requirements.length - 4}</span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                    <Link to={`/jobs/${job._id}`} className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg text-center hover:bg-indigo-700 transition-colors">
                                        View &amp; Apply
                                    </Link>
                                    <button
                                        onClick={() => handleUnsave(job._id)}
                                        className="px-3 py-2 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold rounded-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 clean-card flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5">
                            <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No saved jobs</h3>
                        <p className="text-slate-500 text-sm mt-2 mb-8 max-w-sm mx-auto">
                            You haven't bookmarked any jobs yet. Browse and save the ones that interest you.
                        </p>
                        <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;
