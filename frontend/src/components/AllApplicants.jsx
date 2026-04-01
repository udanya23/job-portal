import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const BACKEND_URL = "http://localhost:5000";
const STATUS_OPTIONS = ["Applied", "Pending", "Interviewing", "Accepted", "Rejected"];

const statusConfig = (s) => {
    if (s === "Accepted")     return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    if (s === "Rejected")     return { cls: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" };
    if (s === "Interviewing") return { cls: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" };
    if (s === "Pending")      return { cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" };
    return                           { cls: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-400" };
};

// ── Interview scheduling modal ──────────────────────────────────────────────
const InterviewModal = ({ app, onClose, onScheduled }) => {
    const [date, setDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    const save = async () => {
        if (!date) { setErr("Please pick a date and time."); return; }
        setSaving(true);
        try {
            const res = await axios.patch(`/applications/${app._id}/status`, { status: "Interviewing", interviewDate: date });
            onScheduled(res.data);
        } catch (e) { setErr(e.response?.data?.message || "Failed to schedule."); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Schedule Interview</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{app.applicant?.name} · {app.job?.title}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1.5">Interview date &amp; time</label>
                        <input type="datetime-local" value={date}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => { setDate(e.target.value); setErr(""); }}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/30 transition-all" />
                    </div>
                    {err && <p className="text-xs text-rose-500">{err}</p>}
                </div>
                <div className="px-6 pb-6 flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={save} disabled={saving} className="flex-[1.5] py-2 bg-[#1a5c40] text-white rounded-lg text-sm hover:bg-[#144d35] disabled:opacity-50 transition-colors">
                        {saving ? "Scheduling…" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Resume PDF modal ────────────────────────────────────────────────────────
const ResumeModal = ({ applicant, onClose }) => {
    const url = `${BACKEND_URL}${applicant.resume}`;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#d4f0e0] text-[#1a5c40] flex items-center justify-center font-semibold text-sm">
                            {(applicant.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{applicant.name}</p>
                            <p className="text-xs text-slate-400">{applicant.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={url} download className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a5c40] text-white text-xs font-medium rounded-lg hover:bg-[#144d35] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            Download
                        </a>
                        <button onClick={onClose} className="w-8 h-8 text-slate-400 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-all">✕</button>
                    </div>
                </div>
                <iframe src={`${url}#toolbar=0`} title={`${applicant.name}'s Resume`} className="flex-1 w-full border-0" />
            </div>
        </div>
    );
};

// ── Applicant Card ──────────────────────────────────────────────────────────
const ApplicantCard = ({ app, onStatusChange, onViewResume }) => {
    const sc = statusConfig(app.status);
    const initial = (app.applicant?.name || "?").charAt(0).toUpperCase();

    return (
        <div className="bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden group">
            {/* Top color strip based on status */}
            <div className={`h-0.5 w-full ${sc.dot.replace("bg-", "bg-")}`} />

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4f0e0] to-[#b2d8c4] text-[#1a5c40] flex items-center justify-center font-semibold text-base shrink-0">
                        {initial}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{app.applicant?.name || "Unknown"}</p>
                                <p className="text-xs text-slate-400 truncate">{app.applicant?.email}</p>
                                {app.applicant?.mobileNumber && (
                                    <p className="text-xs text-slate-400">{app.applicant.mobileNumber}</p>
                                )}
                            </div>
                            {/* Status badge */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border shrink-0 ${sc.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {app.status}
                            </span>
                        </div>

                        {/* Job info */}
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 truncate">
                                    <span className="font-medium text-slate-700">{app.job?.title || "Deleted Job"}</span>
                                    {app.job?.companyName && <span className="text-slate-400"> · {app.job.companyName}</span>}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    Applied {new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 gap-3">
                    {/* Status changer */}
                    <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app._id, e.target.value, app)}
                        className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#1a5c40] transition-all cursor-pointer flex-1 min-w-0"
                    >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>

                    {/* Resume button */}
                    {app.applicant?.resume ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={() => onViewResume(app.applicant)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#1a5c40] text-white text-xs rounded-lg hover:bg-[#144d35] transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                Resume
                            </button>
                            <a
                                href={`${BACKEND_URL}${app.applicant.resume}`}
                                download
                                className="p-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg hover:border-[#b2d8c4] hover:text-[#1a5c40] transition-all"
                                title="Download"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                            </a>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-300 shrink-0">No resume</span>
                    )}
                </div>

                {/* Interview date if scheduled */}
                {app.status === "Interviewing" && app.interviewDate && (
                    <div className="mt-3 px-3 py-2 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <p className="text-[10px] text-violet-600 font-medium">
                            Interview: {new Date(app.interviewDate).toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const AllApplicants = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState("");
    const [resumeApplicant, setResumeApplicant] = useState(null);
    const [interviewApp, setInterviewApp]       = useState(null);
    const [search, setSearch]         = useState("");
    const [filterStatus, setFilterStatus]       = useState("All");

    useEffect(() => {
        axios.get("/applications/my-jobs")
            .then(res => setApplicants(res.data))
            .catch(err => setError(err.response?.data?.message || "Failed to load applicants."))
            .finally(() => setLoading(false));
    }, []);

    const updateStatus = (appId, status, appObj) => {
        if (status === "Interviewing") { setInterviewApp({ ...appObj, _id: appId }); return; }
        axios.patch(`/applications/${appId}/status`, { status })
            .then(() => setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a)))
            .catch(err => console.error(err));
    };

    const onInterviewScheduled = (updated) => {
        setApplicants(prev => prev.map(a =>
            a._id === updated._id ? { ...a, status: "Interviewing", interviewDate: updated.interviewDate } : a
        ));
        setInterviewApp(null);
    };

    const filtered = applicants.filter(app => {
        const matchStatus = filterStatus === "All" || app.status === filterStatus;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            app.applicant?.name?.toLowerCase().includes(q) ||
            app.applicant?.email?.toLowerCase().includes(q) ||
            app.job?.title?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    // Status count badges
    const counts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = applicants.filter(a => a.status === s).length;
        return acc;
    }, {});

    if (loading) return (
        <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#eef4f0]">
            {resumeApplicant && <ResumeModal applicant={resumeApplicant} onClose={() => setResumeApplicant(null)} />}
            {interviewApp   && <InterviewModal app={interviewApp} onClose={() => setInterviewApp(null)} onScheduled={onInterviewScheduled} />}

            <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">

                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <Link to="/home" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#1a5c40] transition-colors mb-3">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Dashboard
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-900">All Applicants</h1>
                        <p className="text-sm text-slate-400 mt-0.5">{applicants.length} total · {filtered.length} shown</p>
                    </div>
                    <Link to="/interviews"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-[#b2d8c4] hover:text-[#1a5c40] transition-all self-start sm:self-auto">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        View Interview Schedule
                    </Link>
                </div>

                {error && (
                    <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">{error}</div>
                )}

                {/* ── Status filter pills ── */}
                <div className="flex gap-2 flex-wrap">
                    {["All", ...STATUS_OPTIONS].map(s => {
                        const sc = s !== "All" ? statusConfig(s) : null;
                        const count = s === "All" ? applicants.length : counts[s];
                        return (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                    filterStatus === s
                                        ? s === "All"
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : `${sc.cls} border-current`
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                {sc && <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />}
                                {s}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === s ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Search ── */}
                <div className="relative max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, email, or job…"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#1a5c40] transition-all"
                    />
                </div>

                {/* ── Cards grid ── */}
                {filtered.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-600">No applicants found</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {search || filterStatus !== "All" ? "Try adjusting your search or filter" : "Applications will appear here once candidates apply"}
                        </p>
                        {(search || filterStatus !== "All") && (
                            <button onClick={() => { setSearch(""); setFilterStatus("All"); }}
                                className="mt-4 text-xs text-[#1a5c40] hover:underline">
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(app => (
                            <ApplicantCard
                                key={app._id}
                                app={app}
                                onStatusChange={updateStatus}
                                onViewResume={setResumeApplicant}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllApplicants;
