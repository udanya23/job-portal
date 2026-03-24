import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const STATUS_OPTIONS = ["Applied", "Pending", "Interviewing", "Accepted", "Rejected"];

const STATUS_STYLE = {
    Applied: "bg-blue-50 text-blue-700 border-blue-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Interviewing: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

const JobApplicants = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null); // tracks which application is being updated
    const [schedulingApp, setSchedulingApp] = useState(null);
    const [interviewDate, setInterviewDate] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, appRes] = await Promise.all([
                    axios.get(`/jobs/${jobId}`),
                    axios.get(`/applications/job/${jobId}`)
                ]);
                setJob(jobRes.data);
                setApplicants(appRes.data);
            } catch (err) {
                console.error("Failed to fetch applicants:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId]);

    const filtered = applicants.filter(app => {
        const q = searchQuery.toLowerCase();
        return !q ||
            app.applicant?.name?.toLowerCase().includes(q) ||
            app.applicant?.email?.toLowerCase().includes(q);
    });

    const handleStatusChange = async (applicationId, newStatus) => {
        setUpdating(applicationId);
        try {
            const res = await axios.patch(`/applications/${applicationId}/status`, { status: newStatus });
            // Update local state to reflect the change
            setApplicants(prev =>
                prev.map(app => app._id === applicationId ? { ...app, status: res.data.status } : app)
            );
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setUpdating(null);
        }
    };

    const submitInterviewSchedule = async () => {
        if (!interviewDate || !schedulingApp) return;
        setUpdating(schedulingApp);
        try {
            const res = await axios.patch(`/applications/${schedulingApp}/status`, {
                status: "Interviewing",
                interviewDate
            });
            setApplicants(prev =>
                prev.map(app => app._id === schedulingApp ? { ...app, status: res.data.status, interviewDate: res.data.interviewDate } : app)
            );
            setSchedulingApp(null);
            setInterviewDate("");
        } catch (err) {
            console.error("Failed to schedule interview:", err);
            alert("Failed to schedule interview. Please try again.");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <Link to="/home" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all group mb-6">
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {job?.title || "Job Applicants"}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                {applicants.length} application{applicants.length !== 1 ? "s" : ""} received
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
                            <span className="text-slate-300">📍</span>
                            {job?.location}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {applicants.length > 0 && (
                    <div className="clean-card p-5">
                        <div className="relative max-w-sm">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search applicants by name or email..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-400 transition"
                            />
                        </div>
                    </div>
                )}

                {/* Applicants Table */}
                {applicants.length === 0 ? (
                    <div className="clean-card p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No applicants yet</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">No one has applied for this position yet. Check back later.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="clean-card py-20 flex flex-col items-center justify-center text-center">
                        <p className="text-lg font-bold text-slate-900 mb-2">No matches found</p>
                        <p className="text-slate-500 text-sm">Try adjusting your search query.</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition uppercase tracking-widest"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <div className="clean-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Applicant</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Applied On</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Update Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filtered.map((app) => (
                                        <tr key={app._id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shrink-0">
                                                        {(app.applicant?.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm tracking-tight">{app.applicant?.name || "Unknown"}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{app.applicant?.email}</p>
                                                        {app.applicant?.mobileNumber && (
                                                            <p className="text-xs text-slate-400">{app.applicant.mobileNumber}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-semibold text-slate-600">
                                                    {new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {app.applicant?.resume ? (
                                                    <a
                                                        href={`http://localhost:5000/uploads/${app.applicant.resume}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={app.applicant.resumeOriginalName || "Resume"}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-lg border border-indigo-100 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        View Resume
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300 text-sm font-medium">—</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[app.status] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="relative">
                                                    <select
                                                        value={app.status}
                                                        disabled={updating === app._id}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            if (newStatus === "Interviewing") {
                                                                setSchedulingApp(app._id);
                                                            } else {
                                                                handleStatusChange(app._id, newStatus);
                                                            }
                                                        }}
                                                        className="appearance-none w-40 pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                                                    >
                                                        {STATUS_OPTIONS.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                    {updating === app._id && (
                                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 border-b-2 border-indigo-500 rounded-full animate-spin" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* Schedule Interview Modal */}
            {schedulingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Schedule Interview</h3>
                        <p className="text-sm text-slate-500 mb-6">Select a date and time for the interview. An email invitation will be sent to the applicant automatically.</p>

                        <div className="space-y-4 mb-8">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Interview Date & Time</label>
                            <input
                                type="datetime-local"
                                value={interviewDate}
                                onChange={e => setInterviewDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all font-medium text-slate-700"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setSchedulingApp(null); setInterviewDate(""); }}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitInterviewSchedule}
                                disabled={!interviewDate}
                                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest shadow-lg shadow-indigo-200"
                            >
                                Schedule & Notify
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <p className="mt-16 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                CareerLink Professional · {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default JobApplicants;
