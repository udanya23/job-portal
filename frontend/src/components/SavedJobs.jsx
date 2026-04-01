import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const SavedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/jobs/saved")
            .then(res => setJobs(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const removeSaved = async (id, e) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await axios.post(`/jobs/${id}/save`);
            setJobs(jobs.filter(j => j._id !== id));
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#eef4f0] py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Jobs</h1>
                        <p className="text-sm text-slate-400 mt-1 font-medium">{jobs.length} opportunities saved</p>
                    </div>
                    <Link to="/jobs" className="text-sm font-bold text-[#1a5c40] hover:text-[#144d35] underline decoration-2 decoration-[#b2d8c4] underline-offset-4 transition-all">
                        Browse More →
                    </Link>
                </div>

                {jobs.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-20 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-inner ring-1 ring-slate-100">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Your collection is empty</h3>
                        <p className="text-slate-400 text-sm mb-8 max-w-xs font-medium">Save jobs that catch your eye and apply whenever you're ready.</p>
                        <Link to="/jobs" className="px-6 py-2.5 bg-[#1a5c40] text-white text-sm font-bold rounded-xl hover:bg-[#144d35] transition-all shadow-lg shadow-[#1a5c40]/10">
                            Explore Job Feed
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {jobs.map((job, idx) => (
                            <Link to={`/jobs/${job._id}`} key={job._id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#b2d8c4] hover:shadow-md transition-all duration-200 group anim-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#e8f5ee] text-[#1a5c40] border border-[#b2d8c4] rounded-xl flex items-center justify-center text-xl font-black shrink-0">
                                        {(job.companyName || "C").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[15px] font-extrabold text-slate-900 group-hover:text-[#1a5c40] truncate transition-colors">{job.title}</h3>
                                        <p className="text-sm font-bold text-slate-500 mt-0.5">{job.companyName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 justify-between sm:justify-end">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {job.location}
                                        </span>
                                        {job.salary && <span className="text-xs font-black text-[#1a5c40] bg-[#e8f5ee] px-2 py-0.5 rounded">{job.salary}</span>}
                                    </div>
                                    <button onClick={(e) => removeSaved(job._id, e)} className="p-2 rounded-lg bg-[#e8f5ee] text-[#1a5c40] hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;
