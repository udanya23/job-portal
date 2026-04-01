import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const STATUS_CONFIG = {
  Applied: { label: "Applied", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" },
  Pending: { label: "Under Review", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" },
  Interviewing: { label: "Interviewing", bg: "bg-[#e8f5ee]", text: "text-[#1a5c40]", dot: "bg-[#1a5c40]", border: "border-[#b2d8c4]" },
  Accepted: { label: "Accepted", bg: "bg-[#e8f5ee]", text: "text-[#1a5c40]", dot: "bg-[#1a5c40]", border: "border-[#b2d8c4]" },
  Rejected: { label: "Not Selected", bg: "bg-slate-50", text: "text-slate-400", dot: "bg-slate-300", border: "border-slate-200" },
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-[#d4f0e0] text-[#1a5c40]",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const avatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const STEP_ORDER = ["Applied", "Pending", "Interviewing"];
const STEP_LABELS = ["Applied", "Review", "Interview"];

const MiniTimeline = ({ status }) => {
  const isDone = status === "Accepted" || status === "Rejected";
  const current = isDone ? 3 : STEP_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-2">
      {STEP_ORDER.map((step, i) => {
        const done = i < current || isDone;
        const active = i === current && !isDone;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full shrink-0 border-2 transition-colors ${done ? "bg-[#1a5c40] border-[#1a5c40]" : active ? "bg-white border-[#1a5c40]" : "bg-white border-slate-200"
                }`} />
              <span className={`text-[9px] mt-1 font-semibold ${done || active ? "text-[#1a5c40]" : "text-slate-300"}`}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEP_ORDER.length - 1 && (
              <div className={`h-px flex-1 mb-3 mx-1 transition-colors ${done ? "bg-[#1a5c40]" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const MyApplications = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "jobseeker") { setLoading(false); return; }
    axios.get("/applications/my-applications")
      .then(res => setApplications(res.data))
      .catch(err => console.error("Failed to fetch applications:", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, 0]));
  applications.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
  const filtered = filter === "All" ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-[#eef4f0] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <Link to="/jobs" className="btn-primary text-sm w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Browse More Jobs
          </Link>
        </div>

        {/* Filter Tabs */}
        {applications.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("All")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filter === "All"
                ? "bg-[#1a5c40] text-white border-[#1a5c40] shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
            >
              All · {applications.length}
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) =>
              counts[key] > 0 ? (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${filter === key
                    ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                    : `bg-white ${cfg.text} ${cfg.border} opacity-70 hover:opacity-100`
                    }`}
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-20 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-[#e8f5ee] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#b2d8c4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No applications yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">Start exploring jobs and apply to roles that match your skills and goals.</p>
            <Link to="/jobs" className="btn-primary text-sm">Explore Jobs</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-slate-400 text-sm font-medium">No applications match this filter.</p>
            <button onClick={() => setFilter("All")} className="text-xs text-[#1a5c40] font-semibold hover:underline mt-2">Show all</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
            {filtered.map((app, i) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending;
              const isInterview = app.status === "Interviewing" && app.interviewDate;
              const firstLetter = (app.job?.companyName || "?").charAt(0).toUpperCase();
              const aColor = avatarColor(app.job?.companyName || "");

              return (
                <div key={app._id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-300 hover:shadow-md transition-all duration-150 animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl font-bold text-base flex items-center justify-center shrink-0 ${aColor}`}>
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm leading-tight truncate">{app.job?.title || "Job Unavailable"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 font-medium">{app.job?.companyName || "Unknown"}</span>
                          {app.job?.location && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                              {app.job.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`shrink-0 chip text-[10px] font-bold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Timeline */}
                  {app.status !== "Accepted" && app.status !== "Rejected" && (
                    <MiniTimeline status={app.status} />
                  )}

                  {/* Accepted banner */}
                  {app.status === "Accepted" && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#e8f5ee] border border-[#b2d8c4] rounded-lg">
                      <svg className="w-4 h-4 text-[#1a5c40] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-bold text-[#1a5c40]">Congratulations — you've been selected! 🎉</span>
                    </div>
                  )}

                  {/* Interview date */}
                  {isInterview && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[#e8f5ee] border border-[#b2d8c4] rounded-lg">
                      <svg className="w-4 h-4 text-[#1a5c40] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#1a5c40]">
                        Interview: {new Date(app.interviewDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                    <span className="text-[11px] font-medium text-slate-400">
                      Applied {new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <Link to={`/jobs/${app.job?._id}`}
                      className="text-xs font-semibold text-[#1a5c40] hover:text-[#144d35] transition-colors flex items-center gap-1">
                      View Job
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
