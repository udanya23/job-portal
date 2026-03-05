import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

// Stat card accent colours
const STAT_COLORS = [
    { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", icon: "bg-indigo-600 shadow-sm" },
    { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100", icon: "bg-violet-600 shadow-sm" },
    { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-100", icon: "bg-teal-600 shadow-sm" },
];

const StatIcon = ({ path, path2 }) => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={path} />
        {path2 && <path strokeLineround="round" strokeLinejoin="round" strokeWidth="2.5" d={path2} />}
    </svg>
);

const Home = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
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
                    const myJobsList = res.data.filter(j => j.recruiter._id === user.id);
                    setMyJobs(myJobsList);
                    setStats([
                        { label: "Active Job Posts", value: myJobsList.length.toString(), iconPath: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                        { label: "Total Applicants", value: "—", iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                        { label: "Pending Reviews", value: "—", iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                    ]);
                } else {
                    const res = await axios.get("/applications/my-applications");
                    setStats([
                        { label: "Applications Sent", value: res.data.length.toString(), iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { label: "Saved Jobs", value: "0", iconPath: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
                        { label: "Profile Views", value: "0", iconPath: "M15 12a3 3 0 11-6 0 3 3 0 016 0z", iconPath2: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
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
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
    );

    const isRecruiter = user.role === "recruiter";

    // Quick actions
    const seekerActions = [
        { to: "/jobs", label: "Explore Jobs", desc: "Find your next opportunity", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, accent: "indigo" },
        { to: "/my-applications", label: "My Applications", desc: "Track application status", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, accent: "violet" },
    ];
    const recruiterActions = [
        { to: "/post-job", label: "Post a Job", desc: "Create a new listing", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>, accent: "indigo" },
        { to: "/jobs", label: "Browse All Jobs", desc: "View every active listing", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, accent: "violet" },
    ];
    const actions = isRecruiter ? recruiterActions : seekerActions;

    const tips = isRecruiter ? [
        { color: "bg-violet-100 text-violet-600", tip: "Write clear job descriptions to attract better candidates." },
        { color: "bg-indigo-100 text-indigo-600", tip: "Respond to applicants within 48 hours to stand out." },
        { color: "bg-teal-100 text-teal-600", tip: "Include salary range — it increases application rates by 30%." },
    ] : [
        { color: "bg-teal-100 text-teal-600", tip: "A complete profile gets 3× more visibility from recruiters." },
        { color: "bg-indigo-100 text-indigo-600", tip: "Tailor your resume headline to each application for best results." },
        { color: "bg-violet-100 text-violet-600", tip: "Apply early — most hires happen in the first 48 hours of posting." },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* ── HERO SECTION ── */}
                <div className="clean-card p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-3 block">
                                {user.role} Dashboard
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                                Welcome back, <br className="hidden sm:block" />
                                <span className="text-indigo-600">{user.name}</span>
                            </h1>
                            <p className="text-slate-500 mt-4 text-sm max-w-lg leading-relaxed">
                                {isRecruiter
                                    ? "Manage your company job openings and connect with top talent through your dashboard."
                                    : "Take the next step in your career journey. View your applications and explore new opportunities."}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link to={isRecruiter ? "/post-job" : "/jobs"} className="btn-primary">
                                {isRecruiter ? "Post a New Job" : "Browse Jobs"}
                            </Link>
                            {!isRecruiter && (
                                <Link to="/my-applications" className="btn-secondary">
                                    My Applications
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── STATS GRID ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => {
                        const c = STAT_COLORS[i % STAT_COLORS.length];
                        return (
                            <div key={i} className="clean-card p-6 flex items-center gap-5 hover-card">
                                <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center shrink-0`}>
                                    <StatIcon path={stat.iconPath} path2={stat.iconPath2} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── TWO-COL SECTION ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Quick Actions */}
                    <div className="clean-card p-6 space-y-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</p>
                        <div className="space-y-2">
                            {actions.map((a, i) => (
                                <Link key={i} to={a.to}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all group">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {a.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 tracking-tight">{a.label}</p>
                                        <p className="text-[11px] text-slate-400">{a.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="lg:col-span-2 clean-card p-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                            Smart {isRecruiter ? "Hiring" : "Career"} Tips
                        </p>
                        <div className="grid sm:grid-cols-3 gap-4 mb-6">
                            {tips.map((tip, i) => (
                                <div key={i} className="space-y-3">
                                    <div className={`w-8 h-8 rounded-lg ${tip.color} flex items-center justify-center text-xs font-bold`}>
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{tip.tip}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                            <p className="text-sm text-indigo-700 font-medium leading-relaxed">
                                {isRecruiter
                                    ? "Pro-tip: Active job posts with clear salary ranges get 40% more applications."
                                    : "Pro-tip: Tailoring your resume headline to the job role increases visit rates by 3x."}
                            </p>
                        </div>
                    </div>

                </div>

                {/* ── MY POSTED JOBS (Recruiter only) ── */}
                {isRecruiter && (
                    <div className="clean-card overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">My Posted Jobs</p>
                            <Link to="/post-job" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                + Add New
                            </Link>
                        </div>
                        {myJobs.length === 0 ? (
                            <div className="px-8 py-12 text-center">
                                <p className="text-slate-400 text-sm font-medium">No jobs posted yet.</p>
                                <Link to="/post-job" className="mt-4 inline-block text-xs font-bold text-indigo-600 hover:text-indigo-700">Post your first job →</Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Position</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Location</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Posted</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Applicants</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {myJobs.map((job) => (
                                            <tr key={job._id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-4">
                                                    <p className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{job.title}</p>
                                                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{job.experience ? `${job.experience} yrs` : ""}</p>
                                                </td>
                                                <td className="px-8 py-4 text-sm font-medium text-slate-500">{job.location}</td>
                                                <td className="px-8 py-4 text-sm font-medium text-slate-500">
                                                    {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <Link
                                                        to={`/jobs/${job._id}/applicants`}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all border border-indigo-100 hover:border-indigo-600"
                                                    >
                                                        View Applicants
                                                    </Link>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/jobs/${job._id}/edit`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-800 text-slate-600 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all border border-slate-200 hover:border-slate-800"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteJob(job._id)}
                                                            disabled={deletingId === job._id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all border border-rose-100 hover:border-rose-600 disabled:opacity-50"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            {deletingId === job._id ? "Deleting..." : "Delete"}
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
                )}

            </div>

            <p className="mt-10 text-center text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                CareerLink © {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default Home;
