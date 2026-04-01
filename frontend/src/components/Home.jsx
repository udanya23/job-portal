import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const PIPELINE_STEPS = [
  { key: "Applied", light: "bg-sky-50 text-sky-700 border-sky-100", bar: "bg-sky-400" },
  { key: "Pending", light: "bg-amber-50 text-amber-700 border-amber-100", bar: "bg-amber-400" },
  { key: "Interviewing", light: "bg-violet-50 text-violet-700 border-violet-100", bar: "bg-violet-400" },
  { key: "Accepted", light: "bg-emerald-50 text-emerald-700 border-emerald-100", bar: "bg-emerald-400" },
  { key: "Rejected", light: "bg-rose-50 text-rose-600 border-rose-100", bar: "bg-rose-400" },
];

const STATUS_BADGE = {
  Applied: "bg-sky-50 text-sky-700 border border-sky-100",
  Pending: "bg-amber-50 text-amber-700 border border-amber-100",
  Interviewing: "bg-violet-50 text-violet-700 border border-violet-100",
  Accepted: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  Rejected: "bg-rose-50 text-rose-600 border border-rose-100",
};

const ICON_COLORS = [
  { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
  { bg: "bg-violet-50", icon: "text-violet-500", border: "border-violet-100" },
  { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100" },
];

const getProfileStrength = (u) => {
  let s = 0;
  if (u?.name) s += 20; if (u?.email) s += 20; if (u?.phone) s += 20;
  if (u?.skills?.length > 0) s += 20; if (u?.resume) s += 20;
  return s;
};

const btn = "inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer";
const btnP = `${btn} px-4 py-2 bg-[#1a5c40] text-white hover:bg-[#144d35] shadow-sm`;
const btnS = `${btn} px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm`;
const cardCls = "bg-white border border-slate-200 rounded-xl shadow-sm";

const StatCard = ({ label, value, icon, sub, index = 0 }) => {
  const c = ICON_COLORS[index % ICON_COLORS.length];
  return (
    <div className={`${cardCls} p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
        <svg className={`w-5 h-5 ${c.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
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
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/"); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (user.role === "recruiter") {
          const res = await axios.get("/jobs");
          const userId = (user.id || user._id)?.toString();
          const mine = res.data.filter(j => j.recruiter?._id?.toString() === userId);
          setMyJobs(mine);
          try {
            const ar = await axios.get("/applications/analytics");
            setAnalytics(ar.data);
            const { overview } = ar.data;
            setStats([
              { label: "Active Job Posts", value: overview.totalJobs.toString(), sub: "Currently live", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { label: "Total Applicants", value: overview.totalApplications.toString(), sub: "Across all jobs", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Active Interviews", value: overview.activeInterviews.toString(), sub: "Scheduled", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            ]);
          } catch {
            setStats([{ label: "Active Job Posts", value: mine.length.toString(), sub: "Currently live", icon: "M21 13.255A23.931 23.931 0 0112 15" }]);
          }
        } else {
          const res = await axios.get("/applications/my-applications");
          setRecentApps(res.data.slice(0, 4));
          setAllApps(res.data);
          const counts = { Applied: 0, Pending: 0, Interviewing: 0, Accepted: 0, Rejected: 0 };
          res.data.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
          setStats([
            { label: "Applications Sent", value: res.data.length.toString(), sub: "Total applied", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Under Review", value: (counts.Pending + counts.Interviewing).toString(), sub: "Awaiting decision", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
            { label: "Interview Scheduled", value: counts.Interviewing.toString(), sub: "Confirmed calls", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          ]);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job post?")) return;
    setDeletingId(jobId);
    try {
      await axios.delete(`/jobs/${jobId}`);
      setMyJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) { alert(err.response?.data?.message || "Failed to delete."); }
    finally { setDeletingId(null); }
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" />
    </div>
  );

  const isRecruiter = user.role === "recruiter";
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const profileStrength = getProfileStrength(user);
  const strengthLabel = profileStrength < 40 ? "Getting Started" : profileStrength < 80 ? "Looking Good" : "All Set!";
  const strengthColor = profileStrength < 40 ? "bg-rose-400" : profileStrength < 80 ? "bg-amber-400" : "bg-[#1a5c40]";

  const pipelineCounts = analytics
    ? PIPELINE_STEPS.reduce((acc, s) => {
      const f = analytics.statusBreakdown?.find(b => b.name === s.key);
      acc[s.key] = f?.value || 0; return acc;
    }, {})
    : {};

  const statusCounts = allApps.reduce((acc, a) => {
    if (PIPELINE_STEPS.find(s => s.key === a.status)) acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const totalApps = allApps.length || 1;

  const quickLinks = isRecruiter
    ? [
      { to: "/post-job", label: "Post a Job", icon: "M12 4v16m8-8H4", color: "text-blue-500 bg-blue-50 border-blue-100" },
      { to: "/jobs", label: "Browse Jobs", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-violet-500 bg-violet-50 border-violet-100" },
      { to: "/applicants", label: "All Applicants", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-amber-500 bg-amber-50 border-amber-100" },
      { to: "/profile", label: "Company Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
    ]
    : [
      { to: "/jobs", label: "Explore Jobs", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "text-blue-500 bg-blue-50 border-blue-100" },
      { to: "/my-applications", label: "Applications", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "text-violet-500 bg-violet-50 border-violet-100" },
      { to: "/saved-jobs", label: "Saved Jobs", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", color: "text-amber-500 bg-amber-50 border-amber-100" },
      { to: "/profile", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
    ];

  return (
    <div className="min-h-screen bg-[#eef4f0] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Greeting */}
        <div className={`${cardCls} p-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1a5c40] text-white text-lg font-bold flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">{getGreeting()} · <span className="capitalize">{user.role}</span></p>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{isRecruiter ? "Manage your openings and connect with top talent." : "Your career journey, at a glance."}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              {isRecruiter ? (
                <><Link to="/post-job" className={btnP}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Post a Job</Link><Link to="/applicants" className={btnS}>View Applicants</Link></>
              ) : (
                <><Link to="/jobs" className={btnP}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>Browse Jobs</Link><Link to="/my-applications" className={btnS}>Applications</Link></>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} icon={s.icon} sub={s.sub} index={i} />)}
        </div>

        {/* Job Seeker section */}
        {!isRecruiter && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Apps */}
            <div className={`lg:col-span-2 ${cardCls} overflow-hidden`}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-800">Recent Applications</p>
                <Link to="/my-applications" className="text-xs font-semibold text-[#1a5c40] hover:text-[#144d35]">View all →</Link>
              </div>
              {recentApps.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-2">No applications yet</p>
                  <Link to="/jobs" className="text-xs font-semibold text-[#1a5c40] hover:underline">Start applying →</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApps.map(app => (
                    <div key={app._id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#d4f0e0] text-[#1a5c40] text-sm font-bold flex items-center justify-center shrink-0">
                          {(app.job?.companyName || "?").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{app.job?.title || "Job Unavailable"}</p>
                          <p className="text-xs text-slate-400 font-medium">{app.job?.companyName || "Unknown"}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_BADGE[app.status] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className={`${cardCls} p-5`}>
                <p className="text-xs font-semibold text-slate-400 mb-3">Profile Strength</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-slate-900">{profileStrength}%</span>
                  <span className="text-sm text-slate-400 mb-1 font-medium">{strengthLabel}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${strengthColor} transition-all duration-700`} style={{ width: `${profileStrength}%` }} />
                </div>
                {profileStrength < 100 && (
                  <p className="text-xs text-slate-400 mt-2">Update your <Link to="/profile" className="text-[#1a5c40] font-semibold hover:underline">profile</Link> to boost visibility.</p>
                )}
              </div>
              {allApps.length > 0 && (
                <div className={`${cardCls} p-5`}>
                  <p className="text-xs font-semibold text-slate-400 mb-4">Status Breakdown</p>
                  <div className="space-y-2.5">
                    {PIPELINE_STEPS.map(step => {
                      const count = statusCounts[step.key] || 0;
                      if (!count) return null;
                      const pct = Math.round((count / totalApps) * 100);
                      return (
                        <div key={step.key}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-600">{step.key}</span>
                            <span className="text-xs text-slate-400">{count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${step.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recruiter pipeline */}
        {isRecruiter && analytics && (
          <div className={`${cardCls} p-6`}>
            <p className="text-xs font-semibold text-slate-400 mb-5">Hiring Pipeline</p>
            <div className="grid grid-cols-5 gap-3">
              {PIPELINE_STEPS.map(s => (
                <div key={s.key} className="text-center">
                  <div className={`py-4 px-2 rounded-xl mb-2 border ${s.light}`}>
                    <span className="text-2xl font-bold">{pipelineCounts[s.key] ?? 0}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recruiter jobs table */}
        {isRecruiter && (
          <div className={`${cardCls} overflow-hidden`}>
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
              <p className="text-sm font-semibold text-slate-800">My Posted Jobs</p>
              <Link to="/post-job" className="text-xs font-semibold text-[#1a5c40] hover:text-[#144d35] flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>Post New
              </Link>
            </div>
            {myJobs.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-slate-400 text-sm font-medium mb-2">No jobs posted yet</p>
                <Link to="/post-job" className="text-xs font-semibold text-[#1a5c40] hover:underline">Post your first job →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{["Position", "Location", "Posted", "Applicants", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest last:text-right">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myJobs.map(job => (
                      <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4"><p className="font-semibold text-slate-900 text-sm">{job.title}</p></td>
                        <td className="px-5 py-4 text-sm text-slate-500">{job.location}</td>
                        <td className="px-5 py-4 text-sm text-slate-400">{new Date(job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                        <td className="px-5 py-4">
                          <Link to={`/jobs/${job._id}/applicants`} className="px-2.5 py-1 bg-[#e8f5ee] text-[#1a5c40] border border-[#b2d8c4] text-xs font-semibold rounded-lg hover:bg-[#1a5c40] hover:text-white transition-colors">View</Link>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 justify-end">
                            <Link to={`/jobs/${job._id}/edit`} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">Edit</Link>
                            <button onClick={() => handleDeleteJob(job._id)} disabled={deletingId === job._id}
                              className="px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-lg hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all disabled:opacity-50">
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
        )}

        {/* Quick Links */}
        <div className={`${cardCls} p-5`}>
          <p className="text-xs font-semibold text-slate-400 mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((a, i) => (
              <Link key={i} to={a.to} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white transition-all group">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${a.color}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={a.icon} /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] font-medium text-slate-300 uppercase tracking-widest py-4">
          CareerLink © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Home;
