import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const BACKEND_URL = "http://localhost:5000";

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    weekday: "short", day: "2-digit", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });

const fmtShort = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const countdown = (d) => {
  const diff = new Date(d) - Date.now();
  if (diff <= 0) return { label: "Completed", cls: "text-slate-400 bg-slate-50 border-slate-200" };
  const hrs = Math.floor(diff / 36e5);
  const days = Math.floor(hrs / 24);
  if (days > 7)  return { label: `In ${days} days`,              cls: "text-sky-600 bg-sky-50 border-sky-200" };
  if (days >= 1) return { label: `In ${days}d ${hrs % 24}h`,    cls: "text-amber-600 bg-amber-50 border-amber-200" };
  if (hrs >= 1)  return { label: `In ${hrs}h`,                  cls: "text-orange-600 bg-orange-50 border-orange-200" };
  return           { label: "Starting soon",                     cls: "text-rose-600 bg-rose-50 border-rose-200" };
};

// ── Reschedule modal ─────────────────────────────────────────────────────────
const RescheduleModal = ({ app, onClose, onSaved }) => {
  const [date, setDate] = useState(
    app.interviewDate ? new Date(app.interviewDate).toISOString().slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    if (!date) { setErr("Please select a date and time."); return; }
    setSaving(true);
    try {
      const res = await axios.patch(`/applications/${app._id}/status`, {
        status: "Interviewing", interviewDate: date,
      });
      onSaved(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to reschedule.");
    } finally { setSaving(false); }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Reschedule Interview</h3>
          <p className="text-xs text-slate-400 mt-0.5">{app.applicant?.name} · {app.job?.title}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">New date &amp; time</label>
            <input
              type="datetime-local"
              value={date}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => { setDate(e.target.value); setErr(""); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/30 transition-all"
            />
          </div>
          {err && <p className="text-xs text-rose-500">{err}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="flex-[1.5] py-2 bg-[#1a5c40] text-white rounded-lg text-sm hover:bg-[#144d35] disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState("");
  const [rescheduleApp, setReschedule] = useState(null);
  const [filter, setFilter]       = useState("upcoming");

  useEffect(() => {
    axios.get("/applications/my-jobs")
      .then(res => setInterviews(res.data.filter(a => a.status === "Interviewing" && a.interviewDate)))
      .catch(e  => setErr(e.response?.data?.message || "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const now      = Date.now();
  const upcoming = interviews.filter(a => new Date(a.interviewDate) > now);
  const past     = interviews.filter(a => new Date(a.interviewDate) <= now);

  const filtered = useMemo(() => {
    const sorted = [...interviews].sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
    if (filter === "upcoming") return sorted.filter(a => new Date(a.interviewDate) > Date.now());
    if (filter === "past")     return sorted.filter(a => new Date(a.interviewDate) <= Date.now()).reverse();
    return sorted;
  }, [interviews, filter]);

  const onRescheduled = (updated) => {
    setInterviews(prev => prev.map(a => a._id === updated._id ? { ...a, interviewDate: updated.interviewDate } : a));
    setReschedule(null);
  };

  const cancelInterview = async (appId) => {
    if (!window.confirm("Cancel this interview? The candidate will revert to Pending.")) return;
    try {
      await axios.patch(`/applications/${appId}/status`, { status: "Pending" });
      setInterviews(prev => prev.filter(a => a._id !== appId));
    } catch (e) { alert(e.response?.data?.message || "Failed."); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef4f0]">
      {rescheduleApp && <RescheduleModal app={rescheduleApp} onClose={() => setReschedule(null)} onSaved={onRescheduled} />}

      {/* Gradient top header */}
      <div className="bg-gradient-to-r from-[#1a5c40] via-[#207a52] to-[#2d9b6a] px-4 pt-10 pb-16">
        <div className="max-w-4xl mx-auto">
          <Link to="/home" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Interview Schedule</h1>
              <p className="text-sm text-white/60 mt-1">
                {upcoming.length} upcoming · {past.length} completed
              </p>
            </div>
            {/* Stat pills */}
            <div className="flex gap-2">
              {[
                { label: "Total",     val: interviews.length,  bg: "bg-white/10 border-white/20 text-white" },
                { label: "Upcoming",  val: upcoming.length,    bg: "bg-white border-white text-[#1a5c40]" },
                { label: "Done",      val: past.length,        bg: "bg-white/10 border-white/20 text-white" },
              ].map(s => (
                <div key={s.label} className={`px-4 py-2.5 rounded-xl border text-center min-w-[64px] ${s.bg}`}>
                  <p className="text-lg font-semibold leading-none">{s.val}</p>
                  <p className="text-[10px] uppercase tracking-wide mt-0.5 opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Main content pulled up over the banner */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-10 space-y-5">

        {err && (
          <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">{err}</div>
        )}

        {/* ── Filter tabs ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
          <div className="flex gap-1">
            {[{ key: "upcoming", label: "Upcoming" }, { key: "past", label: "Completed" }, { key: "all", label: "All" }].map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filter === t.key ? "bg-[#1a5c40] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
            <div className="w-12 h-12 bg-[#e8f5ee] rounded-xl flex items-center justify-center mx-auto mb-4 text-[#1a5c40]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">No {filter === "all" ? "" : filter} interviews</p>
            <p className="text-xs text-slate-400 mt-1">Set an applicant's status to "Interviewing" to schedule one.</p>
            <Link to="/applicants" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a5c40] text-white text-xs rounded-lg hover:bg-[#144d35] transition-colors">
              View Applicants
            </Link>
          </div>
        )}

        {/* ── Interview cards ── */}
        <div className="space-y-3">
          {filtered.map((app) => {
            const cd     = countdown(app.interviewDate);
            const isPast = new Date(app.interviewDate) <= Date.now();

            return (
              <div
                key={app._id}
                className={`bg-white border border-slate-200 rounded-2xl overflow-hidden transition-shadow hover:shadow-sm ${isPast ? "opacity-60" : ""}`}
              >
                {/* accent line */}
                <div className={`h-0.5 ${isPast ? "bg-slate-200" : "bg-[#1a5c40]"}`} />

                <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">

                  {/* Candidate */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#d4f0e0] text-[#1a5c40] flex items-center justify-center font-semibold text-sm shrink-0">
                      {(app.applicant?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{app.applicant?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-400 truncate">{app.applicant?.email}</p>
                      {app.applicant?.mobileNumber && (
                        <p className="text-xs text-slate-400">{app.applicant.mobileNumber}</p>
                      )}
                      {app.applicant?.resume && (
                        <a
                          href={`${BACKEND_URL}${app.applicant.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#1a5c40] hover:underline"
                        >
                          View resume →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-10 bg-slate-100" />

                  {/* Job */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Position</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{app.job?.title || "—"}</p>
                    <p className="text-xs text-[#1a5c40] mt-0.5">{app.job?.companyName}</p>
                    <Link
                      to={`/jobs/${app.job?._id}/applicants`}
                      className="text-[10px] text-slate-400 hover:text-[#1a5c40] transition-colors mt-1 inline-block"
                    >
                      All applicants →
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-10 bg-slate-100" />

                  {/* Time + actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 mb-0.5">Scheduled</p>
                      <p className="text-xs font-medium text-slate-700">{fmt(app.interviewDate)}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] border ${cd.cls}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {cd.label}
                    </span>

                    {!isPast && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setReschedule(app)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-600 hover:border-[#b2d8c4] hover:text-[#1a5c40] transition-all"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => cancelInterview(app._id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] text-rose-400 hover:bg-rose-50 hover:border-rose-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Interviews;
