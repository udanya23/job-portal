import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const BACKEND_URL = "http://localhost:5000";
const STATUS_OPTIONS = ["Applied", "Pending", "Interviewing", "Accepted", "Rejected"];

const statusStyle = (s) => {
    if (s === "Accepted") return "bg-[#e8f5ee] text-[#1a5c40] border-[#b2d8c4]";
    if (s === "Rejected") return "bg-rose-50 text-rose-700 border-rose-200";
    if (s === "Interviewing") return "bg-violet-50 text-violet-700 border-violet-200";
    if (s === "Pending") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-sky-50 text-sky-700 border-sky-200";
};

// Inline PDF viewer modal
const ResumeModal = ({ applicant, onClose }) => {
    const url = `${BACKEND_URL}${applicant.resume}`;
    return (
        <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#d4f0e0] text-[#1a5c40] flex items-center justify-center font-black text-sm">
                            {(applicant.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-slate-900">{applicant.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{applicant.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={url}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a5c40] text-white text-xs font-bold rounded-lg hover:bg-[#144d35] transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </a>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all text-lg"
                        >✕</button>
                    </div>
                </div>
                <iframe
                    src={`${url}#toolbar=0`}
                    title={`${applicant.name}'s Resume`}
                    className="flex-1 w-full border-0"
                />
            </div>
        </div>
    );
};

// Schedule interview date modal
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900">Schedule Interview</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">{app.applicant?.name} · {app.job?.title}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Interview Date &amp; Time</label>
                        <input type="datetime-local" value={date}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => { setDate(e.target.value); setErr(""); }}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/40 transition-all cursor-pointer" />
                    </div>
                    {err && <p className="text-xs text-rose-600 font-semibold">⚠ {err}</p>}
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={save} disabled={saving} className="flex-[1.5] py-2.5 bg-[#1a5c40] text-white rounded-xl font-bold text-sm hover:bg-[#144d35] disabled:opacity-50 transition-colors">
                        {saving ? "Scheduling..." : "Confirm Interview"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const JobApplicants = () => {
    const { id } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [resumeApplicant, setResumeApplicant] = useState(null);
    const [interviewApp, setInterviewApp] = useState(null);

    useEffect(() => {
        Promise.all([
            axios.get(`/jobs/${id}`),
            axios.get(`/applications/job/${id}`)
        ]).then(([jobRes, appRes]) => {
            setJob(jobRes.data);
            setApplicants(appRes.data);
        }).catch(err => {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load data.");
        }).finally(() => setLoading(false));
    }, [id]);

    const updateStatus = (appId, status, appObj) => {
        if (status === "Interviewing") {
            setInterviewApp({ ...appObj, _id: appId, job: job });
            return;
        }
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

    if (loading) return (
        <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#eef4f0] py-10 px-4">
            {resumeApplicant && (
                <ResumeModal applicant={resumeApplicant} onClose={() => setResumeApplicant(null)} />
            )}
            {interviewApp && (
                <InterviewModal app={interviewApp} onClose={() => setInterviewApp(null)} onScheduled={onInterviewScheduled} />
            )}

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Link to="/home" className="text-xs text-slate-400 hover:text-[#1a5c40] transition-colors flex items-center gap-1 mb-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Dashboard
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-900">
                            {job?.title} · <span className="text-[#1a5c40]">Applicants</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {job?.companyName} · {applicants.length} candidate{applicants.length !== 1 ? "s" : ""} found
                        </p>
                    </div>
                    <Link
                        to={`/jobs/${id}`}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        View Job Post
                    </Link>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold">
                        {error}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/60 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider text-right">Resume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {applicants.length === 0 && !error ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-400 text-sm font-bold">No applications yet</p>
                                                <p className="text-slate-300 text-xs">Candidates who apply will appear here</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : applicants.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50/40 transition-colors">
                                        {/* Candidate */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-[#d4f0e0] text-[#1a5c40] rounded-xl flex items-center justify-center font-semibold text-sm shrink-0">
                                                    {(app.applicant?.name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">{app.applicant?.name}</p>
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{app.applicant?.role || "Job Seeker"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-700">{app.applicant?.email}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{app.applicant?.mobileNumber || "—"}</p>
                                        </td>
                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">
                                                {new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </p>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={app.status}
                                                onChange={(e) => updateStatus(app._id, e.target.value, app)}
                                                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border outline-none transition-all cursor-pointer ${statusStyle(app.status)}`}
                                            >
                                                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        {/* Resume */}
                                        <td className="px-6 py-4 text-right">
                                            {app.applicant?.resume ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setResumeApplicant(app.applicant)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#1a5c40] text-white text-xs rounded-lg hover:bg-[#144d35] transition-all"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </button>
                                                    <a
                                                        href={`${BACKEND_URL}${app.applicant.resume}`}
                                                        download
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg hover:border-[#b2d8c4] hover:text-[#1a5c40] transition-all"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        DL
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 italic">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobApplicants;
