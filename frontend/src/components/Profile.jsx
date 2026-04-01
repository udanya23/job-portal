import { useEffect, useState, useRef } from "react";
import axios from "../api/axiosInstance";
import Avatar from "./Avatar";

const BACKEND_URL = "http://localhost:5000";

const Ico = {
  pin: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  phone: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  briefcase: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  mail: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  currency: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  clock: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  camera: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  pencil: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  pdf: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  download: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  plus: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  resume: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  skills: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  work: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  edu: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  person: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  building: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  globe: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  users: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  chart: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  industry: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
};

const inputCls = "w-full bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder:text-slate-400 px-3.5 py-2.5 outline-none focus:border-[#1a5c40] focus:ring-2 focus:ring-[#b2d8c4]/40 transition-all";

const InfoRow = ({ icon, text }) => (
  <div className="flex items-center gap-2.5 text-sm text-slate-600">
    <span className="text-slate-400 shrink-0">{icon}</span>
    <span className="font-medium">{text}</span>
  </div>
);

const SectionCard = ({ id, title, icon, action, children }) => (
  <div id={id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md anim-slide-up">
    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] flex items-center justify-center text-[#1a5c40] shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
            {icon}
          </div>
        )}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const EditBtn = ({ onClick, label = "Edit" }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-[#1a5c40] hover:bg-[#e8f5ee] transition-all"
  >
    {Ico.pencil} {label}
  </button>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [jobsPosted, setJobsPosted] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [draft, setDraft] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/auth/profile");
        setUser(res.data);
        if (res.data.profilePhoto) setPhotoPreview(`${BACKEND_URL}${res.data.profilePhoto}`);
        setSkillsText((res.data.skills || []).join("\n"));
        if (res.data.role === "recruiter") {
          try {
            const jobsRes = await axios.get("/jobs");
            const mine = jobsRes.data.filter(j => j.recruiter?._id === res.data._id || j.recruiter === res.data._id);
            setJobsPosted(mine.length);
          } catch { setJobsPosted(0); }
        }
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const openModal = (key) => {
    setDraft({ ...user });
    setSkillsText((user.skills || []).join("\n"));
    setPhotoError("");
    setResumeError("");
    setActiveModal(key);
  };

  const closeModal = () => {
    setActiveModal(null);
    setPhotoFile(null);
    setResumeFile(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoError(""); setPhotoFile(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("Only image files allowed.");
    if (file.size > 1 * 1024 * 1024) return setPhotoError("Image must be under 1 MB.");
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setResumeError(""); setResumeFile(null);
    if (!file) return;
    if (file.type !== "application/pdf") return setResumeError("Only PDF files allowed.");
    if (file.size > 2 * 1024 * 1024) return setResumeError("PDF must be under 2 MB.");
    setResumeFile(file);
  };

  const handleSave = async (extraFields = {}, files = {}) => {
    setLoading(true);
    try {
      const skillsArray = skillsText.split("\n").map(s => s.trim()).filter(Boolean);
      const data = new FormData();
      const textFields = ["name", "mobileNumber", "address", "gender", "bio", "resumeHeadline", "currentSalary", "totalExperience", "availableToJoin", "companyName", "companyAddress", "companyIndustry", "companySize", "companyWebsite"];
      textFields.forEach(k => { if (draft[k] !== undefined) data.append(k, draft[k] || ""); });
      if (draft.education) data.append("education", JSON.stringify(draft.education));
      if (draft.experience) data.append("experience", JSON.stringify(draft.experience));
      if (skillsArray.length > 0) data.append("skills", JSON.stringify(skillsArray));
      Object.entries(extraFields).forEach(([k, v]) => data.set(k, v));
      if (files.profilePhoto) data.append("profilePhoto", files.profilePhoto);
      if (files.resume) data.append("resume", files.resume);

      const res = await axios.put("/auth/profile-full", data, { headers: { "Content-Type": "multipart/form-data" } });
      const normalized = { ...res.data, id: res.data.id || res.data._id };
      setUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
      closeModal();
      showMessage("Profile updated successfully! ✨", "success");
    } catch (err) {
      showMessage(err.response?.data?.message || "Save failed", "error");
    } finally { setLoading(false); }
  };

  if (!user) return <div className="min-h-screen bg-[#eef4f0] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1a5c40] animate-spin" /></div>;

  const sections = user.role === "jobseeker" ? [
    { label: "Resume", key: "resume", icon: Ico.pdf },
    { label: "Headline", key: "headline", icon: Ico.resume },
    { label: "Skills", key: "skills", icon: Ico.skills },
    { label: "Experience", key: "experience", icon: Ico.work },
    { label: "Education", key: "education", icon: Ico.edu },
    { label: "Personal", key: "personal", icon: Ico.person },
  ] : [
    { label: "About", key: "about", icon: Ico.person },
    { label: "Company", key: "company", icon: Ico.building },
    { label: "Stats", key: "stats", icon: Ico.chart },
  ];

  const uploadedDate = user.resumeUploadedAt ? new Date(user.resumeUploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null;

  return (
    <div className="min-h-screen bg-[#eef4f0] py-8 px-4 font-sans max-w-6xl mx-auto space-y-6">
      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-semibold border flex items-center gap-2.5 anim-slide-down ${message.type === "success" ? "bg-[#e8f5ee] text-[#1a5c40] border-[#b2d8c4]" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
          <span className="shrink-0">{message.type === "success" ? "✓" : "⚠"}</span>
          {message.text}
        </div>
      )}

      {/* ── Header Card with gradient banner ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden anim-slide-up">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-[#1a5c40] via-[#207a52] to-[#2d9b6a] relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10">
            {/* Avatar with camera button */}
            <div className="relative shrink-0">
              <div className="ring-4 ring-white rounded-2xl shadow-lg overflow-hidden">
                <Avatar src={photoPreview} name={user.name} size="xl" />
              </div>
              <button
                onClick={() => openModal("photo")}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-400 hover:text-[#1a5c40] hover:border-[#b2d8c4] transition-all"
              >
                {Ico.camera}
              </button>
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                <button
                  onClick={() => openModal("personal")}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1a5c40] px-2.5 py-1 bg-[#e8f5ee] rounded-lg hover:bg-[#d4f0e0] transition-colors"
                >
                  {Ico.pencil} Edit
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">
                {user.role} · Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-12 mt-6 pt-6 border-t border-slate-100">
            <InfoRow icon={Ico.mail} text={user.email} />
            <InfoRow icon={Ico.pin} text={user.address || "Add location"} />
            <InfoRow icon={Ico.phone} text={user.mobileNumber || "Add mobile number"} />
            {user.role === "jobseeker" && <InfoRow icon={Ico.briefcase} text={user.totalExperience ? `${user.totalExperience} Exp` : "Add experience"} />}
            {user.role === "recruiter" && <InfoRow icon={Ico.building} text={user.companyName || "Add company name"} />}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:w-52 shrink-0 space-y-1 sticky top-24 hidden lg:block">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-3 mb-3">Sections</p>
          {sections.map(s => (
            <a key={s.key} href={`#section-${s.key}`} className="flex items-center gap-3 py-2 px-3 rounded-xl text-sm text-slate-500 hover:bg-white hover:text-[#1a5c40] hover:shadow-sm border border-transparent hover:border-slate-200 transition-all [&>span>svg]:w-3.5 [&>span>svg]:h-3.5">
              <span className="text-slate-400">{s.icon}</span> {s.label}
            </a>
          ))}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {user.role === "jobseeker" && (
            <>
              <SectionCard id="section-resume" title="Resume" icon={Ico.pdf} action={<EditBtn onClick={() => openModal("resume")} label="Update" />}>
                {user.resume ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#d4f0e0] rounded-xl flex items-center justify-center text-[#1a5c40]">
                        {Ico.pdf}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.resumeOriginalName || "resume.pdf"}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Uploaded {uploadedDate}</p>
                      </div>
                    </div>
                    <a href={`${BACKEND_URL}${user.resume}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-[#1a5c40] hover:underline">
                      {Ico.download} Download
                    </a>
                  </div>
                ) : (
                  <button onClick={() => openModal("resume")} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-[#e8f5ee] hover:border-[#b2d8c4] transition-all group">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-[#1a5c40] transition-all shadow-sm">
                      {Ico.pdf}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">No Resume Uploaded</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">Upload PDF resume to start applying</p>
                    </div>
                  </button>
                )}
              </SectionCard>

              <SectionCard id="section-headline" title="Professional Headline" icon={Ico.resume} action={<EditBtn onClick={() => openModal("headline")} />}>
                <p className={`text-sm leading-relaxed ${user.resumeHeadline ? "text-slate-700 font-medium" : "text-slate-400 italic"}`}>
                  {user.resumeHeadline || "Introduce yourself with a strong headline — e.g. 'Senior UI Designer with 5+ years experience in Fintech'"}
                </p>
              </SectionCard>

              <SectionCard id="section-skills" title="Technical Skills" icon={Ico.skills} action={<EditBtn onClick={() => openModal("skills")} />}>
                {user.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((s, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-[#e8f5ee] text-[#1a5c40] border border-[#b2d8c4] rounded-lg text-xs font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No skills listed yet.</p>
                )}
              </SectionCard>

              <SectionCard id="section-experience" title="Employment History" icon={Ico.work} action={<button onClick={() => openModal("experience")} className="text-xs font-bold text-[#1a5c40] hover:underline">+ Add Entry</button>}>
                <div className="space-y-6">
                  {user.experience?.length > 0 ? user.experience.map((exp, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shrink-0 mt-0.5">
                        {Ico.briefcase}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start pt-0.5">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{exp.role}</h4>
                          <span className="text-[10px] font-black text-[#1a5c40] bg-[#e8f5ee] px-2 py-0.5 rounded uppercase tracking-wider">{exp.duration}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">{exp.company}</p>
                        {exp.description && <p className="text-sm text-slate-500 mt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                      </div>
                    </div>
                  )) : <p className="text-sm text-slate-400 italic">No experience added.</p>}
                </div>
              </SectionCard>

              <SectionCard id="section-education" title="Education" icon={Ico.edu} action={<button onClick={() => openModal("education")} className="text-xs font-bold text-[#1a5c40] hover:underline">+ Add Entry</button>}>
                <div className="space-y-6">
                  {user.education?.length > 0 ? user.education.map((edu, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shrink-0 mt-0.5">
                        {Ico.edu}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{edu.degree}</h4>
                          <span className="text-[10px] font-bold text-slate-400">{edu.year}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">{edu.institution}</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-slate-400 italic">No education added.</p>}
                </div>
              </SectionCard>
            </>
          )}

          {user.role === "recruiter" && (
            <>
              <SectionCard id="section-about" title="About / Bio" icon={Ico.person} action={<EditBtn onClick={() => openModal("personal")} />}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${user.bio ? "text-slate-700 font-medium" : "text-slate-400 italic"}`}>
                  {user.bio || "Add a professional bio to build trust with potential candidates."}
                </p>
              </SectionCard>
              <SectionCard id="section-company" title="Company Profile" icon={Ico.building} action={<EditBtn onClick={() => openModal("company")} />}>
                {user.companyName ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-[#1a5c40] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-[#1a5c40]/10">
                        {user.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">{user.companyName}</h3>
                        <p className="text-sm text-slate-500 font-medium">{user.companyIndustry || "Industry not set"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                      <InfoRow icon={Ico.pin} text={user.companyAddress || "Add address"} />
                      <InfoRow icon={Ico.globe} text={user.companyWebsite ? <a href={user.companyWebsite} target="_blank" rel="noreferrer" className="text-[#1a5c40] hover:underline">{user.companyWebsite.replace(/^https?:\/\//, "")}</a> : "Add website"} />
                      <InfoRow icon={Ico.users} text={user.companySize || "Add company size"} />
                    </div>
                  </div>
                ) : <p className="text-sm text-slate-400 italic text-center py-6">Complete your company profile to post jobs.</p>}
              </SectionCard>
              <SectionCard id="section-stats" title="Performance Overview" icon={Ico.chart}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#e8f5ee] border border-[#b2d8c4] p-5 rounded-2xl text-center">
                    <p className="text-3xl font-bold text-[#1a5c40]">{jobsPosted ?? "--"}</p>
                    <p className="text-[10px] font-medium text-[#1a5c40]/60 uppercase tracking-wider mt-1">Jobs Published</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                    <p className="text-xl font-semibold text-slate-700">{new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">Member Since</p>
                  </div>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>

      {/* Shared Modal Backdrop */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 anim-fade-in" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col anim-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Update {activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {activeModal === "photo" && (
                <div className="space-y-6 flex flex-col items-center">
                  <Avatar src={photoPreview} name={user.name} size="xl" className="ring-8 ring-slate-50" />
                  <label className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#e8f5ee] hover:border-[#b2d8c4] transition-all">
                    <span className="text-slate-400 mb-1">{Ico.camera}</span>
                    <p className="text-sm font-bold text-slate-600">{photoFile ? photoFile.name : "Select new Photo"}</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                  {photoError && <p className="text-xs font-bold text-rose-500">⚠ {photoError}</p>}
                </div>
              )}

              {activeModal === "resume" && (
                <div className="space-y-4">
                  <label className="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#e8f5ee] hover:border-[#b2d8c4] transition-all">
                    <span className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-3">{Ico.pdf}</span>
                    <p className="text-sm font-bold text-slate-700">{resumeFile ? resumeFile.name : "Choose PDF Resume"}</p>
                    <p className="text-xs text-slate-400 mt-1">Maximum size 2MB</p>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleResumeChange} />
                  </label>
                  {resumeError && <p className="text-xs font-bold text-rose-500">⚠ {resumeError}</p>}
                </div>
              )}

              {activeModal === "headline" && (
                <textarea value={draft.resumeHeadline || ""} onChange={e => setDraft({ ...draft, resumeHeadline: e.target.value })} placeholder="Write a compelling headline..." className={`${inputCls} min-h-[120px] resize-none`} />
              )}

              {activeModal === "skills" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Skills (one per line)</p>
                  <textarea value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="e.g. React.js" className={`${inputCls} min-h-[160px] resize-none`} />
                </div>
              )}

              {activeModal === "personal" && (
                <div className="space-y-4">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">Full Name</p>
                    <input value={draft.name || ""} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputCls} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">Mobile</p>
                      <input value={draft.mobileNumber || ""} onChange={e => setDraft({ ...draft, mobileNumber: e.target.value })} className={inputCls} /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">Gender</p>
                      <select value={draft.gender || ""} onChange={e => setDraft({ ...draft, gender: e.target.value })} className={inputCls}>
                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select></div>
                  </div>
                  <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">Address / City</p>
                    <input value={draft.address || ""} onChange={e => setDraft({ ...draft, address: e.target.value })} className={inputCls} /></div>
                  {user.role === "jobseeker" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">Experience (yrs)</p>
                        <input value={draft.totalExperience || ""} onChange={e => setDraft({ ...draft, totalExperience: e.target.value })} className={inputCls} /></div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">Notice Period</p>
                        <input value={draft.availableToJoin || ""} onChange={e => setDraft({ ...draft, availableToJoin: e.target.value })} className={inputCls} /></div>
                    </div>
                  )}
                  {user.role === "recruiter" && (
                    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">Professional Bio</p>
                      <textarea value={draft.bio || ""} onChange={e => setDraft({ ...draft, bio: e.target.value })} className={`${inputCls} min-h-[100px] resize-none`} /></div>
                  )}
                </div>
              )}

              {activeModal === "experience" && (
                <div className="space-y-6">
                  {(draft.experience || []).map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative group">
                      <button onClick={() => setDraft({ ...draft, experience: draft.experience.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Company</p>
                        <input value={exp.company} onChange={e => { const arr = [...draft.experience]; arr[idx].company = e.target.value; setDraft({ ...draft, experience: arr }); }} className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Role</p>
                          <input value={exp.role} onChange={e => { const arr = [...draft.experience]; arr[idx].role = e.target.value; setDraft({ ...draft, experience: arr }); }} className={inputCls} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Duration</p>
                          <input placeholder="2020 - Present" value={exp.duration} onChange={e => { const arr = [...draft.experience]; arr[idx].duration = e.target.value; setDraft({ ...draft, experience: arr }); }} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setDraft({ ...draft, experience: [...(draft.experience || []), { company: "", role: "", duration: "", description: "" }] })} className="w-full py-2 border border-dashed border-[#b2d8c4] rounded-xl text-[#1a5c40] text-xs font-bold hover:bg-[#e8f5ee] transition-all">+ Add Experience</button>
                </div>
              )}

              {activeModal === "education" && (
                <div className="space-y-6">
                  {(draft.education || []).map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative group">
                      <button onClick={() => setDraft({ ...draft, education: draft.education.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Degree / Course</p>
                        <input value={edu.degree} onChange={e => { const arr = [...draft.education]; arr[idx].degree = e.target.value; setDraft({ ...draft, education: arr }); }} className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">College/School</p>
                          <input value={edu.institution} onChange={e => { const arr = [...draft.education]; arr[idx].institution = e.target.value; setDraft({ ...draft, education: arr }); }} className={inputCls} />
                        </div>
                        <div className="col-span-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Year</p>
                          <input value={edu.year} onChange={e => { const arr = [...draft.education]; arr[idx].year = e.target.value; setDraft({ ...draft, education: arr }); }} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setDraft({ ...draft, education: [...(draft.education || []), { institution: "", degree: "", year: "" }] })} className="w-full py-2 border border-dashed border-[#b2d8c4] rounded-xl text-[#1a5c40] text-xs font-bold hover:bg-[#e8f5ee] transition-all">+ Add Education</button>
                </div>
              )}

              {activeModal === "company" && (
                <div className="space-y-4">
                  {[
                    { label: "Company Name", key: "companyName" }, { label: "Website (URL)", key: "companyWebsite" },
                    { label: "Industry", key: "companyIndustry" }, { label: "Company Size", key: "companySize" },
                    { label: "Headquarters", key: "companyAddress" }
                  ].map(f => (
                    <div key={f.key}>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 pl-1">{f.label}</p>
                      <input value={draft[f.key] || ""} onChange={e => setDraft({ ...draft, [f.key]: e.target.value })} className={inputCls} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
              <button disabled={loading} onClick={() => {
                if (activeModal === 'photo') handleSave({}, { profilePhoto: photoFile });
                else if (activeModal === 'resume') handleSave({}, { resume: resumeFile });
                else handleSave();
              }} className="flex-[1.5] py-3 px-4 bg-[#1a5c40] text-white rounded-xl font-bold text-sm hover:bg-[#144d35] shadow-lg shadow-[#1a5c40]/10 transition-all disabled:opacity-50">
                {loading ? "Saving changes..." : "Save Updates"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
