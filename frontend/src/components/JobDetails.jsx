import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

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
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                                        <p className="text-indigo-600 font-bold text-lg">{job.companyName}</p>
                                        <p className="text-slate-500 font-semibold flex items-center gap-2">
                                            <span className="text-slate-300">📍</span> {job.location}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Job seeker: Apply button */}
                            {user?.role === "jobseeker" && (
                                <button
                                    onClick={handleApply}
                                    disabled={applying || hasApplied}
                                    className="w-full md:w-auto px-10 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all text-sm uppercase tracking-widest shadow-xl shadow-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
                                >
                                    {applying ? "Processing..." : hasApplied ? "Already Applied" : "Submit Application"}
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
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Quick Overview</h3>
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Proposed Salary</span>
                                        <span className="text-slate-900 font-bold text-lg">{job.salary || "Competitive"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience Required</span>
                                        <span className="text-slate-900 font-bold">{experienceLabel(job.experience)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Published On</span>
                                        <span className="text-slate-900 font-bold">{new Date(job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border border-slate-100 rounded-2xl">
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
