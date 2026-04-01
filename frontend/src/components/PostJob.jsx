import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axiosInstance";

const EXP_OPTIONS = [
  { label: "Fresher (0–1 yr)", value: "0-1" },
  { label: "1–3 Years", value: "1-3" },
  { label: "3–5 Years", value: "3-5" },
  { label: "5+ Years", value: "5+" },
];

const EMPTY = { title: "", description: "", location: "", salary: "", experience: "0-1", deadline: "" };
const inputCls = "w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 font-medium px-3.5 py-2.5 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/40 transition-all";

const PostJob = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "recruiter") { navigate("/home"); return; }
    setCompanyName(user.companyName || "");
  }, [navigate]);

  useEffect(() => {
    if (!isEditing) return;
    axios.get(`/jobs/${id}`).then(res => {
      const j = res.data;
      setForm({ title: j.title || "", description: j.description || "", location: j.location || "", salary: j.salary || "", experience: j.experience || "0-1", deadline: j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : "" });
      setSkills(Array.isArray(j.requirements) ? j.requirements : []);
    }).catch(() => setError("Failed to load job details.")).finally(() => setFetchLoading(false));
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (raw) => {
    const tag = raw.trim().replace(/,$/, "");
    if (tag && !skills.includes(tag)) setSkills(p => [...p, tag]);
    setSkillInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const payload = { ...form, companyName, requirements: skills };
      if (isEditing) await axios.put(`/jobs/${id}`, payload);
      else await axios.post("/jobs", payload);
      navigate("/home");
    } catch (err) { setError(err.response?.data?.message || (isEditing ? "Failed to update" : "Failed to post")); }
    finally { setLoading(false); }
  };

  if (fetchLoading) return <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#eef4f0] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-7">
          <button onClick={() => navigate("/home")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors mb-4 group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEditing ? "Edit Job Post" : "Post an Opening"}</h1>
          <p className="text-sm text-slate-500 mt-1">{isEditing ? "Update the details of your listing" : "Target the right talent with a clear description"}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <div className="w-9 h-9 rounded-xl bg-[#1a5c40] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {(companyName.charAt(0) || "C").toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isEditing ? "Editing as" : "Posting as"}</p>
              <p className="text-sm font-bold text-slate-800">{companyName}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-4">Basic Information</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Position Title *</label>
                  <input required name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior Product Designer" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location *</label>
                    <input required name="location" value={form.location} onChange={handleChange} placeholder="e.g. Remote or Mumbai" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Salary Package</label>
                    <input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. ₹12L – ₹18L" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience Required</label>
                    <select name="experience" value={form.experience} onChange={handleChange} className={`${inputCls} cursor-pointer`}>
                      {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Application Deadline *</label>
                    <input required type="date" name="deadline" value={form.deadline} onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]} className={`${inputCls} cursor-pointer`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-4">Required Skills</p>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Skills & Technologies <span className="text-slate-400 font-normal ml-1">— press Enter to add</span>
              </label>
              <div
                className="min-h-[48px] flex flex-wrap gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg cursor-text focus-within:border-[#1a5c40] transition-all"
                onClick={() => document.getElementById("skill-input").focus()}
              >
                {skills.map(sk => (
                  <span key={sk} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a5c40] text-white text-xs font-semibold rounded-md">
                    {sk}
                    <button type="button" onClick={() => setSkills(p => p.filter(s => s !== sk))} className="hover:opacity-70 transition-opacity">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                <input id="skill-input" type="text" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); } }}
                  onBlur={() => skillInput.trim() && addSkill(skillInput)}
                  placeholder={skills.length === 0 ? "e.g. React, Node.js, Figma..." : ""}
                  className="flex-1 min-w-[130px] bg-transparent outline-none text-sm placeholder:text-slate-400 py-0.5 font-medium"
                />
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-4">Job Description</p>
              <textarea required name="description" rows="7" value={form.description} onChange={handleChange}
                placeholder="Outline the core responsibilities, expectations, and what success looks like in this role..."
                className={`${inputCls} resize-none`} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center py-3 bg-[#1a5c40] text-white text-sm font-semibold rounded-lg hover:bg-[#144d35] disabled:opacity-50 transition-colors">
                {loading ? (isEditing ? "Saving…" : "Publishing…") : (isEditing ? "Save Changes" : "Publish Opportunity")}
              </button>
              <button type="button" onClick={() => navigate("/home")}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
