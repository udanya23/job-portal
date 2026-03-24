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

// Copy link button
const CopyLinkButton = () => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button onClick={copy}
            className="w-full flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-800 transition-all">
            {copied ? (
                <>
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-emerald-600">Link Copied!</span>
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Share Job Link
                </>
            )}
        </button>
    );
};

// Shared small icon+label row for sidebar
const MetaRow = ({ icon, label, value, valueClass = "text-slate-900" }) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`font-bold text-sm ${valueClass}`}>{value}</p>
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

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await axios.get(`/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                console.error("Failed to fetch job details:", err);
                navigate("/jobs");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, navigate]);

    // Check if user has already applied (only for job seekers)
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        if (!parsed || parsed.role !== "jobseeker") return;

        axios.get(`/applications/check/${id}`)
            .then(res => setHasApplied(res.data.applied))
            .catch(() => { });
    }, [id]);

    const handleApply = async () => {
        if (!user || user.role !== "jobseeker") {
            setMessage({ text: "Only job seekers can apply for jobs.", type: "error" });
            return;
        }

        setApplying(true);
        try {
            await axios.post("/applications/apply", { jobId: id });
            setMessage({ text: "Application submitted successfully!", type: "success" });
            setHasApplied(true);
        } catch (err) {
            const errMsg = err.response?.data?.message || "Failed to submit application";
            setMessage({ text: errMsg, type: "error" });
            // If already applied, mark as applied so button greys out
            if (err.response?.status === 400) {
                setHasApplied(true);
            }
        } finally {
            setApplying(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this job post? This action cannot be undone.")) return;
        setDeleting(true);
        try {
            await axios.delete(`/jobs/${id}`);
            navigate("/home");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete job.");
            setDeleting(false);
        }
    };

    const experienceLabel = (exp) => {
        const map = { "0-1": "Fresher (0–1 yr)", "1-3": "1–3 Years", "3-5": "3–5 Years", "5+": "5+ Years" };
        return map[exp] || exp || "Any Experience";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!job) return null;

    const isOwner = user?.role === "recruiter" && job.recruiter?._id === user?.id;
    const isExpired = job.deadline && new Date(job.deadline) < new Date(new Date().setHours(0, 0, 0, 0));

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all group">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to browse
                </Link>

                <div className="clean-card overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-100 bg-white">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-3xl text-slate-400">
                                    {job.companyName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
                                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 items-center">
                                        <p className="text-indigo-600 font-bold text-lg">{job.companyName}</p>
                                        <p className="text-slate-500 font-semibold flex items-center gap-1.5 text-sm">
                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {job.location}
                                        </p>
                                        <p className="text-slate-400 text-xs font-semibold">
                                            Posted {timeAgo(job.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button: Apply or Login */}
                            {(!user || user.role === "jobseeker") && (
                                <button
                                    onClick={user ? handleApply : () => navigate("/login")}
                                    disabled={(user && (applying || hasApplied)) || isExpired}
                                    className="w-full md:w-auto px-10 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all text-sm uppercase tracking-widest shadow-xl shadow-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
                                >
                                    {!user ? "Login to Apply" : isExpired && !hasApplied ? "Closed / Expired" : applying ? "Processing..." : hasApplied ? "Already Applied" : "Submit Application"}
                                </button>
                            )}

                            {/* Recruiter (owner): Edit + Delete buttons */}
                            {isOwner && (
                                <div className="flex gap-3 shrink-0">
                                    <Link
                                        to={`/jobs/${id}/edit`}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-all text-xs uppercase tracking-widest border border-rose-100 hover:border-rose-600 disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        {deleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {message.text && (
                            <div className={`mt-8 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12 bg-white">
                        <div className="md:col-span-2 space-y-12">
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Description</h3>
                                <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-[15px]">
                                    {job.description}
                                </div>
                            </div>

                            {job.requirements && job.requirements.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Key Requirements</h3>
                                    <ul className="space-y-4">
                                        {job.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-4 text-slate-600 font-semibold text-sm">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            <div className="p-8 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Quick Overview</p>
                                <div className="space-y-4">
                                    <MetaRow
                                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                        label="Proposed Salary"
                                        value={job.salary || "Competitive"}
                                    />
                                    <MetaRow
                                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                        label="Experience Required"
                                        value={experienceLabel(job.experience)}
                                    />
                                    <MetaRow
                                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                        label="Published On"
                                        value={new Date(job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                                    />
                                    {job.deadline && (
                                        <MetaRow
                                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                            label="Application Deadline"
                                            value={new Date(job.deadline).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                                            valueClass={isExpired ? "text-rose-600" : "text-amber-600"}
                                        />
                                    )}
                                </div>
                            </div>

                            <CopyLinkButton />
                            <div className="p-5 border border-slate-100 rounded-2xl">
                                <p className="text-xs font-semibold text-slate-400 text-center leading-relaxed">
                                    {isOwner
                                        ? "You posted this job. Use Edit to update the details or Delete to remove it."
                                        : "Apply with your professional profile. Ensure your resume is up to date."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
