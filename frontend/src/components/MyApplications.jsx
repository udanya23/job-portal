import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

// Professional, restrained color palette — using slate/slate tones for text,
// soft backgrounds. Color is used only as an accent, not the dominant element.
const STATUS_CONFIG = {
    Applied:      { label: "Applied",       bg: "bg-slate-100",     text: "text-slate-600",   dot: "bg-slate-400",    border: "border-slate-200"   },
    Pending:      { label: "Under Review",  bg: "bg-amber-50",      text: "text-amber-700",   dot: "bg-amber-400",    border: "border-amber-200"   },
    Interviewing: { label: "Interviewing",  bg: "bg-indigo-50",     text: "text-indigo-700",  dot: "bg-indigo-400",   border: "border-indigo-200"  },
    Accepted:     { label: "Accepted",      bg: "bg-emerald-50",    text: "text-emerald-700", dot: "bg-emerald-500",  border: "border-emerald-200" },
    Rejected:     { label: "Not Selected",  bg: "bg-slate-50",      text: "text-slate-500",   dot: "bg-slate-300",    border: "border-slate-200"   },
};

// Color per company initial (cycles through 6 options)
const AVATAR_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
];
const avatarColor = (name = "") => {
    const code = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[code];
};

const STEP_ORDER = ["Applied", "Pending", "Interviewing"];

const MiniTimeline = ({ status }) => {
    const isDone  = status === "Accepted" || status === "Rejected";
    const current = isDone ? 3 : STEP_ORDER.indexOf(status);
    const STEP_LABELS = ["Applied", "Review", "Interview"];

    return (
        <div className="flex items-center gap-0 mt-3">
            {STEP_ORDER.map((step, i) => {
                const done   = i < current || isDone;
                const active = i === current && !isDone;
                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors border-2
                                ${done ? "bg-slate-700 border-slate-700"
                                : active ? "bg-white border-slate-700"
                                : "bg-white border-slate-200"}`}
                            />
                            <span className={`text-[9px] mt-1 font-semibold
                                ${done || active ? "text-slate-600" : "text-slate-300"}`}>
                                {STEP_LABELS[i]}
                            </span>
                        </div>
                        {i < STEP_ORDER.length - 1 && (
                            <div className={`h-px flex-1 mb-3 transition-colors mx-1 ${done ? "bg-slate-700" : "bg-slate-200"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// SVG icons
const Icons = {
    search: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    doc:    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    calendar: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    location: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    briefcase: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    arrow: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
};

const MyApplications = () => {
    const [user, setUser]               = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [filter, setFilter]           = useState("All");

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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
        </div>
    );

    // Summary counts
    const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, 0]));
    applications.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

    const filtered = filter === "All" ? applications : applications.filter(a => a.status === filter);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-5xl mx-auto space-y-7">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Applications</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
                        </p>
                    </div>
                    <Link to="/jobs" className="btn-primary flex items-center gap-2 w-fit">
                        {Icons.search}
                        Browse More Jobs
                    </Link>
                </div>

                {/* Status summary strip */}
                {applications.length > 0 && (
                    <div className="clean-card p-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter("All")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter === "All" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400"}`}
                        >
                            All · {applications.length}
                        </button>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) =>
                            counts[key] > 0 ? (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                                        ${filter === key ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-offset-1 ring-slate-300` : `bg-white ${cfg.text} ${cfg.border}`}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {cfg.label} · {counts[key]}
                                </button>
                            ) : null
                        )}
                    </div>
                )}

                {/* Content */}
                {applications.length === 0 ? (
                    <div className="clean-card p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 text-slate-200">
                            {Icons.doc}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
                        <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">Start exploring jobs and apply to roles that fit your skills.</p>
                        <Link to="/jobs" className="btn-primary">Explore Jobs</Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="clean-card p-12 text-center text-slate-400 text-sm font-medium">
                        No applications match this filter.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((app) => {
                            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending;
                            const isInterview = app.status === "Interviewing" && app.interviewDate;
                            const firstLetter = (app.job?.companyName || "?").charAt(0).toUpperCase();
                            const aColor = avatarColor(app.job?.companyName || "");
                            return (
                                <div key={app._id} className="clean-card p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Colored company initial — no black */}
                                            <div className={`w-11 h-11 rounded-xl font-bold text-base flex items-center justify-center shrink-0 ${aColor}`}>
                                                {firstLetter}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                                                    {app.job?.title || "Job Unavailable"}
                                                </p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {app.job?.companyName || "Unknown Company"}
                                                    </span>
                                                    {app.job?.location && (
                                                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                            {Icons.location}
                                                            {app.job.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Minimal status badge */}
                                        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Mini timeline — only for in-progress */}
                                    {app.status !== "Accepted" && app.status !== "Rejected" && (
                                        <MiniTimeline status={app.status} />
                                    )}

                                    {/* Accepted banner */}
                                    {app.status === "Accepted" && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xs font-bold text-emerald-700">Congratulations — you've been selected!</span>
                                        </div>
                                    )}

                                    {/* Interview date */}
                                    {isInterview && (
                                        <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                                            <span className="text-indigo-400">{Icons.calendar}</span>
                                            <span className="text-xs font-bold text-indigo-700">
                                                Interview: {new Date(app.interviewDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                            </span>
                                        </div>
                                    )}

                                    {/* Footer row */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                            {Icons.briefcase}
                                            Applied {new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </span>
                                        <Link to={`/jobs/${app.job?._id}`}
                                            className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                                            View Job {Icons.arrow}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <p className="mt-16 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                CareerLink · {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default MyApplications;
