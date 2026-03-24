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
    experience: "0-1",
    deadline: ""
};

const PostJob = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [companyName, setCompanyName] = useState("");
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "recruiter") {
            navigate("/home");
        } else {
            setCompanyName(user.companyName || "");
        }
    }, [navigate]);

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
                    experience: job.experience || "0-1",
                    deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ""
                });
                setSkills(Array.isArray(job.requirements) ? job.requirements : []);
            } catch {
                setError("Failed to load job details.");
            } finally {
                setFetchLoading(false);
            }
        };
        fetch();
    }, [id, isEditing]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const addSkill = (raw) => {
        const tag = raw.trim().replace(/,$/, "");
        if (tag && !skills.includes(tag)) setSkills(prev => [...prev, tag]);
        setSkillInput("");
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill(skillInput);
        } else if (e.key === "Backspace" && skillInput === "" && skills.length > 0) {
            setSkills(prev => prev.slice(0, -1));
        }
    };

    const removeSkill = (sk) => setSkills(prev => prev.filter(s => s !== sk));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = { ...formData, companyName, requirements: skills };
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

    if (fetchLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
        </div>
    );

    const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all placeholder:text-slate-400 font-medium";

    return (
        <div className="min-h-screen bg-slate-50 py-14 px-4 font-sans">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {isEditing ? "Edit Job Post" : "Post an Opening"}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {isEditing ? "Update the details of your listing" : "Target the right talent with a clear description"}
                    </p>
                </div>

                <div className="clean-card overflow-hidden">
                    {/* Company badge */}
                    <div className="px-8 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {companyName.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isEditing ? "Editing as" : "Posting as"}</p>
                            <p className="text-sm font-bold text-slate-800">{companyName}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-7">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Section: Basic Info */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Basic Info</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Position Title *</label>
                                    <input required name="title" value={formData.title} onChange={handleChange}
                                        placeholder="e.g. Senior Product Designer" className={inputClass} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Office Location *</label>
                                        <input required name="location" value={formData.location} onChange={handleChange}
                                            placeholder="e.g. Remote or Mumbai, IN" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Proposed Salary</label>
                                        <input name="salary" value={formData.salary} onChange={handleChange}
                                            placeholder="e.g. ₹12L – ₹18L" className={inputClass} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Experience Required</label>
                                        <select name="experience" value={formData.experience} onChange={handleChange}
                                            className={`${inputClass} appearance-none cursor-pointer`}>
                                            {EXPERIENCE_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Application Deadline *</label>
                                        <input required type="date" name="deadline" value={formData.deadline} onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`${inputClass} cursor-pointer`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Section: Skills (Tag Input) */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Required Skills</p>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                Skills &amp; Technologies <span className="text-slate-400 font-normal ml-1">— press Enter or comma to add</span>
                            </label>
                            <div
                                className="min-h-[52px] flex flex-wrap gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all cursor-text"
                                onClick={() => document.getElementById("skill-input").focus()}
                            >
                                {skills.map(sk => (
                                    <span key={sk} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md">
                                        {sk}
                                        <button type="button" onClick={() => removeSkill(sk)} className="hover:text-slate-300 transition-colors leading-none">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                                <input
                                    id="skill-input"
                                    type="text"
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                    onBlur={() => skillInput.trim() && addSkill(skillInput)}
                                    placeholder={skills.length === 0 ? "e.g. React, Node.js, Figma..." : ""}
                                    className="flex-1 min-w-[140px] bg-transparent outline-none text-sm placeholder:text-slate-400 py-0.5"
                                />
                            </div>
                            {skills.length > 0 && (
                                <p className="text-[11px] text-slate-400 mt-1.5">{skills.length} skill{skills.length !== 1 ? "s" : ""} added</p>
                            )}
                        </div>

                        <hr className="border-slate-100" />

                        {/* Section: Description */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Description</p>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role Description *</label>
                                <textarea
                                    required name="description" rows="6"
                                    value={formData.description} onChange={handleChange}
                                    placeholder="Outline the core responsibilities, expectations, and what success looks like in this role..."
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-3 pt-2">
                            <button type="submit" disabled={loading}
                                className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors text-sm disabled:opacity-50">
                                {loading ? (isEditing ? "Saving…" : "Publishing…") : (isEditing ? "Save Changes" : "Publish Opportunity")}
                            </button>
                            <button type="button" onClick={() => navigate("/home")}
                                className="px-8 py-3.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-8">
                    Recruiter Console · {companyName}
                </p>
            </div>
        </div>
    );
};

export default PostJob;
