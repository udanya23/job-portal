import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

const STATUS_OPTIONS = ["Applied", "Pending", "Interviewing", "Accepted", "Rejected"];

const STATUS_STYLES = {
    Applied:      { pill: "bg-sky-50 text-sky-700 border-sky-200",       dot: "bg-sky-500",     label: "Applied" },
    Pending:      { pill: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500",   label: "Under Review" },
    Interviewing: { pill: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500", label: "Interviewing" },
    Accepted:     { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Accepted" },
    Rejected:     { pill: "bg-rose-50 text-rose-600 border-rose-200",     dot: "bg-rose-500",    label: "Rejected" },
};

const AVATAR_COLORS = [
    "bg-violet-500","bg-sky-500","bg-emerald-500","bg-amber-500","bg-rose-500",
    "bg-indigo-500","bg-teal-500","bg-orange-500",
];

const avatarColor = (name) => {
    let hash = 0;
    for (const ch of (name || "?")) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const AllApplicants = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterJob, setFilterJob]       = useState("");
    const [searchQuery, setSearchQuery]   = useState("");
    const [updatingId, setUpdatingId]     = useState(null);
    const [schedulingApp, setSchedulingApp] = useState(null);
    const [interviewDate, setInterviewDate] = useState("");
    const [openPopover, setOpenPopover]   = useState(null); // appId whose popover is open

    const fetchApps = () => {
        setLoading(true);
        setError(null);
        axios.get("/applications/my-jobs")
            .then(res => setApplications(Array.isArray(res.data) ? res.data : []))
            .catch(err => setError(err.response?.data?.message || err.message || "Failed to load applicants"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchApps(); }, []);

    const handleStatusChange = async (appId, newStatus) => {
        setOpenPopover(null);
        if (newStatus === "Interviewing") {
            setSchedulingApp(appId);
            return;
        }
        setUpdatingId(appId);
        try {
            const res = await axios.patch(`/applications/${appId}/status`, { status: newStatus });
            setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: res.data.status } : a));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const submitInterviewSchedule = async () => {
        if (!interviewDate || !schedulingApp) return;
        setUpdatingId(schedulingApp);
        try {
            const res = await axios.patch(`/applications/${schedulingApp}/status`, {
                status: "Interviewing",
                interviewDate,
            });
            setApplications(prev =>
                prev.map(app => app._id === schedulingApp
                    ? { ...app, status: res.data.status, interviewDate: res.data.interviewDate }
                    : app)
            );
            setSchedulingApp(null);
            setInterviewDate("");
        } catch {
            alert("Failed to schedule interview. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    const jobOptions = [...new Map(applications.map(a => [a.job?._id, a.job?.title])).entries()].filter(([id]) => id);

    const filtered = applications.filter(a => {
        const matchJob    = !filterJob    || a.job?._id === filterJob;
        const matchStatus = !filterStatus || a.status === filterStatus;
        const q           = searchQuery.toLowerCase();
        const matchSearch = !q || a.applicant?.name?.toLowerCase().includes(q) || a.applicant?.email?.toLowerCase().includes(q);
        return matchJob && matchStatus && matchSearch;
    });

    // Count per status
    const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = applications.filter(a => a.status === s).length;
        return acc;
    }, {});

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="clean-card p-10 text-center max-w-md w-full">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load applicants</h3>
                <p className="text-sm text-rose-600 font-medium mb-6">{error}</p>
                <button onClick={fetchApps} className="btn-primary">Try Again</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans" onClick={() => setOpenPopover(null)}>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Applicants</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {filtered.length} applicant{filtered.length !== 1 ? "s" : ""} across your job posts
                        </p>
                    </div>
                    <button onClick={fetchApps}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors self-start">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Pipeline strip — click to filter */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(s => {
                        const cfg     = STATUS_STYLES[s];
                        const active  = filterStatus === s;
                        return (
                            <button key={s}
                                onClick={() => setFilterStatus(active ? "" : s)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all ${active ? cfg.pill + " shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${active ? "bg-white/60" : "bg-slate-100 text-slate-400"}`}>
                                    {statusCounts[s]}
                                </span>
                            </button>
                        );
                    })}
                    {(filterStatus || filterJob || searchQuery) && (
                        <button onClick={() => { setFilterJob(""); setFilterStatus(""); setSearchQuery(""); }}
                            className="px-3 py-1.5 text-rose-500 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors border border-rose-100">
                            Reset filters ×
                        </button>
                    )}
                </div>

                {/* Search + Job Filter */}
                <div className="clean-card p-4 flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px] relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search by name or email…"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <select value={filterJob} onChange={e => setFilterJob(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 transition-colors">
                            <option value="">All Jobs</option>
                            {jobOptions.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div className="clean-card py-20 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No applicants found</h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-xs">
                            {applications.length > 0 ? "No results match the current filters." : "Applications to your jobs will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="clean-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        {["Applicant", "Contact", "Job Applied For", "Applied On", "Status", ""].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filtered.map(app => {
                                        const cfg = STATUS_STYLES[app.status] || STATUS_STYLES.Applied;
                                        const color = avatarColor(app.applicant?.name);
                                        return (
                                            <tr key={app._id} className="hover:bg-slate-50/40 transition-colors group">
                                                {/* Applicant */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full ${color} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                                                            {app.applicant?.name?.charAt(0).toUpperCase() || "?"}
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-900">{app.applicant?.name || "Unknown"}</p>
                                                    </div>
                                                </td>
                                                {/* Contact */}
                                                <td className="px-5 py-4">
                                                    <p className="text-xs font-medium text-slate-600">{app.applicant?.email || "—"}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{app.applicant?.mobileNumber || ""}</p>
                                                </td>
                                                {/* Job */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-slate-800 max-w-[170px] truncate">{app.job?.title || "—"}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{app.job?.location || ""}</p>
                                                    {app.status === "Interviewing" && app.interviewDate && (
                                                        <p className="text-[10px] font-bold text-violet-600 mt-1">
                                                            📅 {new Date(app.interviewDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                                        </p>
                                                    )}
                                                </td>
                                                {/* Date */}
                                                <td className="px-5 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                                                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                                </td>
                                                {/* Status badge */}
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${cfg.pill}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                                {/* Update action */}
                                                <td className="px-5 py-4">
                                                    <div className="relative" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            disabled={updatingId === app._id}
                                                            onClick={() => setOpenPopover(openPopover === app._id ? null : app._id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:border-slate-900 hover:text-slate-900 transition-colors disabled:opacity-50"
                                                        >
                                                            {updatingId === app._id ? (
                                                                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            )}
                                                            Update
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                        </button>

                                                        {openPopover === app._id && (
                                                            <div className="absolute right-0 top-9 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                                                {STATUS_OPTIONS.map(s => {
                                                                    const sc = STATUS_STYLES[s];
                                                                    const isCurrent = app.status === s;
                                                                    return (
                                                                        <button key={s}
                                                                            onClick={() => handleStatusChange(app._id, s)}
                                                                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold transition-colors ${isCurrent ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                                                                        >
                                                                            <span className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
                                                                            {sc.label}
                                                                            {isCurrent && <svg className="w-3 h-3 ml-auto text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
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

            {/* Schedule Interview Modal */}
            {schedulingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Schedule Interview</h3>
                        <p className="text-sm text-slate-500 mb-6">Select a date & time. An email invitation will be sent automatically.</p>
                        <div className="space-y-4 mb-6">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Interview Date &amp; Time</label>
                            <input type="datetime-local" value={interviewDate}
                                onChange={e => setInterviewDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all font-medium text-slate-700 cursor-pointer" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setSchedulingApp(null); setInterviewDate(""); }}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={submitInterviewSchedule} disabled={!interviewDate}
                                className="flex-1 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors disabled:opacity-50">
                                Schedule &amp; Notify
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <p className="mt-10 text-center text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                CareerLink © {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default AllApplicants;
