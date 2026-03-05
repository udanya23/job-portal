import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const STATUS_CONFIG = {
    Applied: { style: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500" },
    Pending: { style: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400" },
    Interviewing: { style: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-500" },
    Accepted: { style: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
    Rejected: { style: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-500" },
};

const STATUS_ICON = {
    Accepted: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
    ),
    Rejected: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

const MyApplications = () => {
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        if (!user) return;
        if (user.role !== "jobseeker") { setLoading(false); return; }
        axios.get("/applications/my-applications")
            .then((res) => setApplications(res.data))
            .catch((err) => console.error("Failed to fetch applications:", err))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Applications</h1>
                        <p className="text-slate-500 text-sm mt-1">Found {applications.length} active application{applications.length !== 1 ? "s" : ""} in your history</p>
                    </div>
                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                    >
                        Browse more jobs
                    </Link>
                </div>

                {/* Content */}
                {applications.length === 0 ? (
                    <div className="clean-card p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No applications found</h3>
                        <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">You haven't applied to any roles yet. Start exploring jobs to build your history.</p>
                        <Link to="/jobs" className="btn-secondary px-8">
                            Explore jobs
                        </Link>
                    </div>
                ) : (
                    <div className="clean-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Job Details</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Application Date</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {applications.map((app) => {
                                        const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending;
                                        return (
                                            <tr key={app._id} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                                                            {(app.job?.companyName || "?").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-900 text-[15px] group-hover:text-indigo-600 transition tracking-tight truncate">{app.job?.title || "Job Unavailable"}</p>
                                                            <p className="text-xs font-medium text-slate-500 mt-0.5">{app.job?.companyName || "Unknown Company"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-semibold text-slate-600">
                                                        {new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cfg.style}`}>
                                                        {STATUS_ICON[app.status] ? (
                                                            STATUS_ICON[app.status]
                                                        ) : (
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                        )}
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Link to={`/jobs/${app.job?._id}`} className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all">
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
            <p className="mt-16 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                CareerLink Professional · {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default MyApplications;
