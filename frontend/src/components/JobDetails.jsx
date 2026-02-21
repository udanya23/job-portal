import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));

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

    const handleApply = async () => {
        if (!user || user.role !== "jobseeker") {
            setMessage({ text: "Only job seekers can apply for jobs.", type: "error" });
            return;
        }

        setApplying(true);
        try {
            await axios.post("/applications/apply", { jobId: id });
            setMessage({ text: "Application submitted successfully!", type: "success" });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || "Failed to submit application", type: "error" });
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-8 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Jobs
                </Link>

                <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 md:p-12 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl">
                                    {job.companyName.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 mb-2">{job.title}</h1>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        <p className="text-indigo-600 font-bold">{job.companyName}</p>
                                        <p className="text-slate-400 font-medium flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            {job.location}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {user?.role === "jobseeker" && (
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-70 transition-all"
                                >
                                    {applying ? "Submitting..." : "Apply Now"}
                                </button>
                            )}
                        </div>

                        {message.text && (
                            <div className={`mt-8 p-4 rounded-xl text-sm font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                                }`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-10">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-4">Job Description</h3>
                                <div className="text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">
                                    {job.description}
                                </div>
                            </div>

                            {job.requirements && job.requirements.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 mb-4">Requirements</h3>
                                    <ul className="space-y-3">
                                        {job.requirements.map((req, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-500 font-medium">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Job Overview</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Salary</p>
                                        <p className="text-slate-900 font-black">{job.salary || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company</p>
                                        <p className="text-slate-900 font-black">{job.companyName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Posted</p>
                                        <p className="text-slate-900 font-black">{new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
