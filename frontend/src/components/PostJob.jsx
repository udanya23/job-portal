import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axiosInstance";

const EXPERIENCE_OPTIONS = [
    { label: "Fresher (0–1 yr)", value: "0-1" },
    { label: "1–3 Years", value: "1-3" },
    { label: "3–5 Years", value: "3-5" },
    { label: "5+ Years", value: "5+" },
];

const EMPTY_FORM = {
    title: "",
    description: "",
    location: "",
    salary: "",
    requirements: "",
    experience: "0-1"
};

const PostJob = () => {
    const { id } = useParams(); // present when editing
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Guard: recruiter only
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "recruiter") {
            navigate("/home");
        } else {
            setCompanyName(user.companyName || "");
        }
    }, [navigate]);

    // If editing, fetch the existing job and pre-fill
    useEffect(() => {
        if (!isEditing) return;
        const fetch = async () => {
            try {
                const res = await axios.get(`/jobs/${id}`);
                const job = res.data;
                setFormData({
                    title: job.title || "",
                    description: job.description || "",
                    location: job.location || "",
                    salary: job.salary || "",
                    requirements: Array.isArray(job.requirements)
                        ? job.requirements.join(", ")
                        : job.requirements || "",
                    experience: job.experience || "0-1"
                });
            } catch (err) {
                setError("Failed to load job details.");
            } finally {
                setFetchLoading(false);
            }
        };
        fetch();
    }, [id, isEditing]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const requirementsArray = formData.requirements
                .split(",")
                .map(r => r.trim())
                .filter(r => r !== "");

            const payload = { ...formData, companyName, requirements: requirementsArray };

            if (isEditing) {
                await axios.put(`/jobs/${id}`, payload);
            } else {
                await axios.post("/jobs", payload);
            }
            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.message || (isEditing ? "Failed to update job" : "Failed to post job"));
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-6 font-sans">
            <div className="max-w-2xl mx-auto space-y-8">

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {isEditing ? "Edit Job Post" : "Post an Opening"}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isEditing
                            ? "Update the details of your job listing"
                            : "Target the right talent with a detailed job description"}
                    </p>
                </div>

                <div className="clean-card p-10 bg-white">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Company Badge */}
                    <div className="mb-8 flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {companyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                {isEditing ? "Editing as" : "Posting as"}
                            </p>
                            <p className="text-sm font-bold text-indigo-700">{companyName}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Position Title</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Senior Product Designer"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Office Location</label>
                                <input
                                    required
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Remote or Mumbai, IN"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Proposed Salary</label>
                                <input
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. ₹12L - ₹18L"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Experience Required</label>
                            <select
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                            >
                                {EXPERIENCE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Required Skills (Comma separated)</label>
                            <input
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="e.g. Figma, React, Prototyping"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Role Description</label>
                            <textarea
                                required
                                name="description"
                                rows="6"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Outline the core responsibilities and expectations..."
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-400 font-medium"
                            ></textarea>
                        </div>

                        <div className="pt-6 flex flex-col md:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                            >
                                {loading
                                    ? (isEditing ? "Saving..." : "Publishing...")
                                    : (isEditing ? "Save Changes" : "Publish Opportunity")}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/home")}
                                className="px-10 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-[0.2em]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                    Recruiter Console · {companyName}
                </p>
            </div>
        </div>
    );
};

export default PostJob;
