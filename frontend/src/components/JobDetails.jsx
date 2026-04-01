import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const AVATAR_COLORS = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-[#d4f0e0] text-[#1a5c40]", "bg-rose-100 text-rose-700"];
const avatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const expLabel = (exp) => ({ "0-1": "Fresher (0–1 yr)", "1-3": "1–3 Years", "3-5": "3–5 Years", "5+": "5+ Years" }[exp] || exp || "Any");

const CopyLink = () => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <button onClick={copy} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all">
      {copied ? <><svg className="w-3.5 h-3.5 text-[#1a5c40]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg><span className="text-[#1a5c40]">Link Copied!</span></> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Share Job Link</>}
    </button>
  );
};

const MetaRow = ({ icon, label, value, valueClass = "text-slate-900" }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`font-semibold text-sm ${valueClass}`}>{value}</p>
    </div>
  </div>
);

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [user, setUser] = useState(null);

  useEffect(() => { const s = localStorage.getItem("user"); if (s) setUser(JSON.parse(s)); }, []);
  useEffect(() => {
    axios.get(`/jobs/${id}`).then(r => setJob(r.data)).catch(() => navigate("/jobs")).finally(() => setLoading(false));
  }, [id, navigate]);
  useEffect(() => {
    const s = localStorage.getItem("user"); const parsed = s ? JSON.parse(s) : null;
    if (!parsed || parsed.role !== "jobseeker") return;
    axios.get(`/applications/check/${id}`).then(r => setHasApplied(r.data.applied)).catch(() => { });
  }, [id]);

  const handleApply = async () => {
    if (!user || user.role !== "jobseeker") { setMessage({ text: "Only job seekers can apply.", type: "error" }); return; }
    setApplying(true);
    try { await axios.post("/applications/apply", { jobId: id }); setMessage({ text: "Application submitted! 🎉", type: "success" }); setHasApplied(true); }
    catch (err) { setMessage({ text: err.response?.data?.message || "Failed to apply", type: "error" }); if (err.response?.status === 400) setHasApplied(true); }
    finally { setApplying(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this job post?")) return;
    setDeleting(true);
    try { await axios.delete(`/jobs/${id}`); navigate("/home"); }
    catch (err) { alert(err.response?.data?.message || "Failed to delete."); setDeleting(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" /></div>;
  if (!job) return null;

  const isOwner = user?.role === "recruiter" && job.recruiter?._id === user?.id;
  const isExpired = job.deadline && new Date(job.deadline) < new Date(new Date().setHours(0, 0, 0, 0));
  const aColor = avatarColor(job.companyName);
  const card = "bg-white border border-slate-200 rounded-xl shadow-sm";

  return (
    <div className="min-h-screen bg-[#eef4f0] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors mb-6 group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className={`${card} p-6`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl font-bold text-2xl flex items-center justify-center shrink-0 ${aColor}`}>
                  {job.companyName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-slate-900 leading-snug">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                    <span className="text-[#1a5c40] font-bold text-sm">{job.companyName}</span>
                    <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {job.location}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Posted {timeAgo(job.createdAt)}</span>
                    {isExpired && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">Expired</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                {job.salary && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">💰 {job.salary}</span>}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">💼 {expLabel(job.experience)}</span>
              </div>
              {message.text && (
                <div className={`mt-4 p-3.5 rounded-xl text-sm font-medium border flex items-center gap-2 anim-slide-down ${message.type === "success" ? "bg-[#e8f5ee] text-[#1a5c40] border-[#b2d8c4]" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {message.type === "success" ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  </svg>
                  {message.text}
                </div>
              )}
            </div>

            {/* Description */}
            <div className={`${card} p-6`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-4">Job Description</p>
              <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-medium">{job.description}</div>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className={`${card} p-6`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-4">Key Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#e8f5ee] text-[#1a5c40] border border-[#b2d8c4] rounded-lg text-xs font-semibold">{req}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className={`${card} p-5`}>
              {(!user || user.role === "jobseeker") && (
                <button onClick={user ? handleApply : () => navigate("/login")}
                  disabled={(user && (applying || hasApplied)) || isExpired}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-3 ${hasApplied ? "bg-[#e8f5ee] text-[#1a5c40] border border-[#b2d8c4] cursor-default"
                      : isExpired ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#1a5c40] text-white hover:bg-[#144d35] shadow-sm"
                    }`}>
                  {!user ? "Login to Apply" : isExpired && !hasApplied ? "Closed / Expired" : applying ? "Submitting..." : hasApplied ? "✓ Application Submitted" : "Apply Now"}
                </button>
              )}
              {isOwner && (
                <div className="space-y-2">
                  <Link to={`/jobs/${id}/edit`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Listing
                  </Link>
                  <button onClick={handleDelete} disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {deleting ? "Deleting..." : "Delete Post"}
                  </button>
                </div>
              )}
              <CopyLink />
            </div>

            <div className={`${card} p-5`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-5">Job Details</p>
              <div className="space-y-4">
                <MetaRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Salary" value={job.salary || "Competitive"} />
                <MetaRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} label="Experience" value={expLabel(job.experience)} />
                <MetaRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Published" value={new Date(job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} />
                {job.deadline && (
                  <MetaRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Deadline" value={new Date(job.deadline).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })} valueClass={isExpired ? "text-rose-600" : "text-amber-600"} />
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 font-medium text-center leading-relaxed">
                {isOwner ? "You posted this job. Edit or delete it above." : "Apply with your profile. Keep your resume up to date."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
