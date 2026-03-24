import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
};

// Soft colored icon backgrounds per index
const ICON_STYLES = [
    { bg: "bg-blue-50", icon: "text-blue-500", ring: "ring-1 ring-blue-100" },
    { bg: "bg-amber-50", icon: "text-amber-500", ring: "ring-1 ring-amber-100" },
    { bg: "bg-violet-50", icon: "text-violet-500", ring: "ring-1 ring-violet-100" },
    { bg: "bg-emerald-50", icon: "text-emerald-500", ring: "ring-1 ring-emerald-100" },
];

// Accent stripe colors for stat cards
const ACCENT_COLORS = ["bg-blue-400", "bg-amber-400", "bg-violet-400", "bg-emerald-400"];

const StatCard = ({ label, value, icon, sub, index = 0 }) => {
    const style = ICON_STYLES[index % ICON_STYLES.length];
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    return (
        <div className="clean-card p-6 flex items-start gap-4 relative overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Accent stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent} rounded-l-xl`} />
            <div className={`w-11 h-11 rounded-xl ${style.bg} ${style.ring} flex items-center justify-center shrink-0 ml-2`}>
                <svg className={`w-5 h-5 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                </svg>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
            </div>
        </div>
    );
};

const PIPELINE_STEPS = [
    { key: "Applied", color: "bg-sky-500", light: "bg-sky-50 text-sky-700" },
    { key: "Pending", color: "bg-amber-500", light: "bg-amber-50 text-amber-700" },
    { key: "Interviewing", color: "bg-violet-500", light: "bg-violet-50 text-violet-700" },
    { key: "Accepted", color: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700" },
    { key: "Rejected", color: "bg-rose-400", light: "bg-rose-50 text-rose-600" },
];

const PIPELINE_BAR_COLORS = ["bg-sky-400", "bg-amber-400", "bg-violet-400", "bg-emerald-400", "bg-rose-400"];

const STATUS_BADGE = {
    Applied: "bg-sky-50 text-sky-700 border-sky-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Interviewing: "bg-violet-50 text-violet-700 border-violet-200",
    Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-600 border-rose-200",
};

// Profile strength calculator (very simple heuristic based on user object)
const getProfileStrength = (user) => {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.email) score += 20;
    if (user?.phone) score += 20;
    if (user?.skills?.length > 0) score += 20;
    if (user?.resume) score += 20;
    return score;
};

const Home = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [recentApps, setRecentApps] = useState([]);
    const [allApps, setAllApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) { navigate("/"); return; }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                if (user.role === "recruiter") {
                    const res = await axios.get("/jobs");
                    const myJobsList = res.data.filter(j => j.recruiter?._id?.toString() === user.id?.toString());
                    setMyJobs(myJobsList);
                    try {
                        const analyticsRes = await axios.get("/applications/analytics");
                        const { overview } = analyticsRes.data;
                        setAnalytics(analyticsRes.data);
                        setStats([
                            { label: "Active Job Posts", value: overview.totalJobs.toString(), sub: "Currently live", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                            { label: "Total Applicants", value: overview.totalApplications.toString(), sub: "Across all jobs", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                            { label: "Active Interviews", value: overview.activeInterviews.toString(), sub: "Scheduled", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                        ]);
                    } catch {
                        setStats([
                            { label: "Active Job Posts", value: myJobsList.length.toString(), sub: "Currently live", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                            { label: "Total Applicants", value: "—", sub: "No data yet", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                            { label: "Pending Reviews", value: "—", sub: "No data yet", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                        ]);
                    }
                } else {
                    const res = await axios.get("/applications/my-applications");
                    setRecentApps(res.data.slice(0, 3));
                    setAllApps(res.data);
                    const counts = { Applied: 0, Pending: 0, Interviewing: 0, Accepted: 0, Rejected: 0 };
                    res.data.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
                    setStats([
                        { label: "Applications Sent", value: res.data.length.toString(), sub: "Total applied", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { label: "Under Review", value: (counts.Pending + counts.Interviewing).toString(), sub: "Awaiting decision", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                        { label: "Interview Scheduled", value: counts.Interviewing.toString(), sub: "You've got calls!", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                    ]);
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job post? This action cannot be undone.")) return;
        setDeletingId(jobId);
        try {
            await axios.delete(`/jobs/${jobId}`);
            setMyJobs(prev => {
                const updated = prev.filter(j => j._id !== jobId);
                setStats(s => s.map((stat, i) => i === 0 ? { ...stat, value: updated.length.toString() } : stat));
                return updated;
            });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete job.");
        } finally {
            setDeletingId(null);
        }
    };

    if (!user || loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
        </div>
    );

    const isRecruiter = user.role === "recruiter";
    const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

    // Pipeline counts for recruiter
    const pipelineCounts = analytics
        ? PIPELINE_STEPS.reduce((acc, s) => {
            const found = analytics.statusBreakdown?.find(b => b.name === s.key);
            acc[s.key] = found?.value || 0;
            return acc;
        }, {})
        : {};

    // Application status counts for job seeker infographic
    const statusCounts = allApps.reduce((acc, a) => {
        if (PIPELINE_STEPS.find(s => s.key === a.status)) acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
    }, {});
    const totalApps = allApps.length || 1;

    // Profile strength
    const profileStrength = getProfileStrength(user);
    const strengthLabel = profileStrength < 40 ? "Getting Started" : profileStrength < 80 ? "Looking Good" : "All Set!";
    const strengthColor = profileStrength < 40 ? "bg-rose-400" : profileStrength < 80 ? "bg-amber-400" : "bg-emerald-400";

    const QUICK_ACTION_ICONS = [
        { bg: "bg-blue-50", icon: "text-blue-500" },
        { bg: "bg-violet-50", icon: "text-violet-500" },
        { bg: "bg-amber-50", icon: "text-amber-500" },
        { bg: "bg-emerald-50", icon: "text-emerald-500" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* ── GREETING BANNER ── */}
                <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f5f3ff 100%)" }}>
                    {/* Decorative circles */}
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-100/40 pointer-events-none" />
                    <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-violet-100/40 pointer-events-none" />
                    <div className="p-8 md:p-10 relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-lg">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-0.5">
                                        {getGreeting()} · <span className="capitalize">{user.role}</span>
                                    </p>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                                        {user.name}
                                    </h1>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {isRecruiter
                                            ? "Manage your openings and connect with top talent."
                                            : "Your career journey at a glance — keep pushing forward."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 shrink-0">
                                {isRecruiter ? (
                                    <>
                                        <Link to="/post-job" className="btn-primary flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                            Post a Job
                                        </Link>
                                        <Link to="/applicants" className="btn-secondary">
                                            View Applicants
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/jobs" className="btn-primary flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            Browse Jobs
                                        </Link>
                                        <Link to="/my-applications" className="btn-secondary">
                                            My Applications
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── STAT CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <StatCard key={i} label={stat.label} value={stat.value} icon={stat.icon} sub={stat.sub} index={i} />
                    ))}
                </div>

                {/* ── JOB SEEKER INFOGRAPHICS ── */}
                {!isRecruiter && allApps.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Application Status Distribution */}
                        <div className="clean-card p-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Application Status Breakdown</p>
                            <div className="space-y-2.5">
                                {PIPELINE_STEPS.map((step, i) => {
                                    const count = statusCounts[step.key] || 0;
                                    const pct = Math.round((count / totalApps) * 100);
                                    if (count === 0) return null;
                                    return (
                                        <div key={step.key}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-slate-600">{step.key}</span>
                                                <span className="text-xs font-bold text-slate-400">{count} · {pct}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${PIPELINE_BAR_COLORS[i]} transition-all duration-700`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Profile Strength */}
                        <div className="clean-card p-5 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Profile Strength</p>
                                <p className="text-3xl font-bold text-slate-900">{profileStrength}%</p>
                                <p className="text-sm text-slate-500 mt-0.5 font-medium">{strengthLabel}</p>
                            </div>
                            <div className="mt-4">
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${strengthColor} transition-all duration-700`}
                                        style={{ width: `${profileStrength}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2">
                                    {profileStrength < 100
                                        ? <>Add more info in your <Link to="/profile" className="text-blue-500 hover:underline font-semibold">profile</Link> to boost your visibility.</>
                                        : "Your profile is complete — great visibility to recruiters!"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── RECRUITER: PIPELINE + JOBS TABLE ── */}
                {isRecruiter && (
                    <>
                        {/* Hiring Pipeline */}
                        {analytics && (
                            <div className="clean-card p-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Hiring Pipeline</p>
                                <div className="grid grid-cols-5 gap-3">
                                    {PIPELINE_STEPS.map((step, i) => (
                                        <div key={step.key} className="flex flex-col items-center gap-2">
                                            <div className={`w-full rounded-lg py-3 flex flex-col items-center ${step.light}`}>
                                                <span className="text-2xl font-bold leading-none">{pipelineCounts[step.key] ?? 0}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{step.key}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pipeline bar infographic */}
                                {Object.values(pipelineCounts).some(v => v > 0) && (() => {
                                    const total = Object.values(pipelineCounts).reduce((s, v) => s + v, 0) || 1;
                                    return (
                                        <div className="mt-5 pt-4 border-t border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Pipeline Distribution</p>
                                            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                                                {PIPELINE_STEPS.map((step, i) => {
                                                    const pct = (pipelineCounts[step.key] / total) * 100;
                                                    if (!pct) return null;
                                                    return (
                                                        <div
                                                            key={step.key}
                                                            className={`h-full ${PIPELINE_BAR_COLORS[i]} transition-all duration-700`}
                                                            style={{ width: `${pct}%` }}
                                                            title={`${step.key}: ${pipelineCounts[step.key]}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                {PIPELINE_STEPS.map((step, i) => pipelineCounts[step.key] > 0 && (
                                                    <span key={step.key} className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                                                        <span className={`w-2 h-2 rounded-full ${PIPELINE_BAR_COLORS[i]} inline-block`} />
                                                        {step.key}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {analytics.topJobsData?.length > 0 && (
                                    <div className="mt-6 pt-5 border-t border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Top Performing Jobs</p>
                                        <div className="space-y-3">
                                            {analytics.topJobsData.map((job, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-slate-700 truncate flex-1">{job.name}</span>
                                                    <span className="text-xs font-bold text-slate-400 shrink-0">{job.count} apps</span>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(job.count / Math.max(1, analytics.overview.totalApplications)) * 100}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Posted Jobs Table */}
                        <div className="clean-card overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">My Posted Jobs</p>
                                <Link to="/post-job" className="text-xs font-bold text-slate-900 hover:text-slate-600 transition-colors flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                    Add New
                                </Link>
                            </div>
                            {myJobs.length === 0 ? (
                                <div className="px-6 py-14 text-center">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium mb-3">No jobs posted yet.</p>
                                    <Link to="/post-job" className="text-xs font-bold text-slate-900 hover:underline">Post your first job →</Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/60">
                                            <tr>
                                                {["Position", "Location", "Posted", "Applicants", "Actions"].map(h => (
                                                    <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] last:text-right">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {myJobs.map((job) => (
                                                <tr key={job._id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-slate-600 transition-colors">{job.title}</p>
                                                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{job.experience ? `${job.experience} yrs exp` : ""}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{job.location}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                                        {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/jobs/${job._id}/applicants`}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                to={`/jobs/${job._id}/edit`}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteJob(job._id)}
                                                                disabled={deletingId === job._id}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all disabled:opacity-50"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                {deletingId === job._id ? "…" : "Delete"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ── JOB SEEKER: RECENT APPLICATIONS ── */}
                {!isRecruiter && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Applications */}
                        <div className="lg:col-span-2 clean-card overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Recent Applications</p>
                                <Link to="/my-applications" className="text-xs font-bold text-slate-900 hover:text-slate-600 transition-colors">View all →</Link>
                            </div>
                            {recentApps.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-slate-400 text-sm mb-3">No applications yet.</p>
                                    <Link to="/jobs" className="text-xs font-bold text-slate-900 hover:underline">Start applying →</Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentApps.map(app => {
                                        const cfg = STATUS_BADGE[app.status] || "bg-slate-50 text-slate-500 border-slate-200";
                                        return (
                                            <div key={app._id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold flex items-center justify-center shrink-0 border border-blue-100">
                                                        {(app.job?.companyName || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 text-sm truncate">{app.job?.title || "Job Unavailable"}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{app.job?.companyName || "Unknown"}</p>
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${cfg}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="clean-card p-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Quick Actions</p>
                            <div className="space-y-2">
                                {[
                                    { to: "/jobs", label: "Explore Jobs", desc: "Find your next opportunity", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                                    { to: "/my-applications", label: "My Applications", desc: "Track your progress", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                                    { to: "/saved-jobs", label: "Saved Jobs", desc: "Bookmarked opportunities", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
                                    { to: "/profile", label: "My Profile", desc: "Update your resume", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                                ].map((a, i) => (
                                    <Link key={i} to={a.to}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                                        <div className={`w-9 h-9 rounded-lg ${QUICK_ACTION_ICONS[i].bg} flex items-center justify-center ${QUICK_ACTION_ICONS[i].icon} shrink-0 group-hover:scale-110 transition-transform`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={a.icon} />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                                            <p className="text-[11px] text-slate-400">{a.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── RECRUITER QUICK LINKS ── */}
                {isRecruiter && (
                    <div className="clean-card p-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Quick Actions</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { to: "/post-job", label: "Post a Job", icon: "M12 4v16m8-8H4" },
                                { to: "/jobs", label: "Browse All Jobs", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                                { to: "/applicants", label: "All Applicants", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                                { to: "/profile", label: "Company Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                            ].map((a, i) => (
                                <Link key={i} to={a.to}
                                    className="flex items-center gap-2.5 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                                    <div className={`w-8 h-8 rounded-lg ${QUICK_ACTION_ICONS[i].bg} flex items-center justify-center ${QUICK_ACTION_ICONS[i].icon} shrink-0 group-hover:scale-110 transition-transform`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={a.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <p className="mt-10 text-center text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                CareerLink © {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default Home;
