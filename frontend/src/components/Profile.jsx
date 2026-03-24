import { useEffect, useState, useRef } from "react";
import axios from "../api/axiosInstance";
import Avatar from "./Avatar";

const BACKEND_URL = "http://localhost:5000";

// ── SVG icon library ──────────────────────────────────────────────────────────
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

// ── tiny helpers ──────────────────────────────────────────────────────────────
const InfoRow = ({ icon, text }) => (
  <div className="flex items-center gap-2.5 text-sm text-slate-600">
    <span className="text-slate-400 shrink-0">{icon}</span>
    <span>{text}</span>
  </div>
);

const SectionCard = ({ id, title, icon, action, children }) => (
  <div id={id} className="clean-card p-6 md:p-8 hover-card">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const EditBtn = ({ onClick, label = "Edit" }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
  >
    {Ico.pencil} {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [jobsPosted, setJobsPosted] = useState(null);

  // Active modal: null | 'photo' | 'resume' | 'headline' | 'skills' | 'education' | 'experience' | 'personal' | 'company'
  const [activeModal, setActiveModal] = useState(null);

  // Local draft state for each modal
  const [draft, setDraft] = useState({});

  // File states
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [skillsText, setSkillsText] = useState((draft.skills || []).join("\n"));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/auth/profile");
        setUser(res.data);
        if (res.data.profilePhoto) setPhotoPreview(`${BACKEND_URL}${res.data.profilePhoto}`);
        // Fetch jobs count for recruiter
        if (res.data.role === "recruiter") {
          try {
            const jobsRes = await axios.get("/jobs");
            const mine = jobsRes.data.filter(j => j.recruiter?._id === res.data._id || j.recruiter === res.data._id);
            setJobsPosted(mine.length);
          } catch { setJobsPosted(0); }
        }
      } catch (err) { console.log(err); }
    };
    fetchProfile();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const openModal = (key) => {
    setDraft({ ...user }); // seed draft from live user
    setPhotoError("");
    setResumeError("");
    setActiveModal(key);
  };

  const closeModal = () => {
    setActiveModal(null);
    setPhotoFile(null);
    setResumeFile(null);
  };

  // Photo handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoError("");
    setPhotoFile(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoError("Only image files allowed.");
    if (file.size > 1 * 1024 * 1024) return setPhotoError("Image must be under 1 MB.");
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  // Resume handler
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setResumeError("");
    setResumeFile(null);
    if (!file) return;
    if (file.type !== "application/pdf") return setResumeError("Only PDF files allowed.");
    if (file.size > 2 * 1024 * 1024) return setResumeError("PDF must be under 2 MB.");
    setResumeFile(file);
  };

  const handleSave = async (extraFields = {}, files = {}) => {
    setLoading(true);
    try {
      const skillsArray = skillsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const data = new FormData();

      const textFields = [
        "name", "mobileNumber", "address", "gender", "bio",
        "resumeHeadline", "currentSalary", "totalExperience", "availableToJoin",
        "companyName", "companyAddress", "companyIndustry", "companySize", "companyWebsite"
      ];
      textFields.forEach((k) => { if (draft[k] !== undefined) data.append(k, draft[k] || ""); });

      if (draft.education) data.append("education", JSON.stringify(draft.education));
      if (draft.experience) data.append("experience", JSON.stringify(draft.experience));
      // if (draft.skills) data.append("skills", JSON.stringify(draft.skills));
      // ⭐ use converted skills array
      if (skillsArray.length > 0)
        data.append("skills", JSON.stringify(skillsArray));

      Object.entries(extraFields).forEach(([k, v]) => data.set(k, v));

      if (files.profilePhoto) data.append("profilePhoto", files.profilePhoto);
      if (files.resume) data.append("resume", files.resume);

      const res = await axios.put("/auth/profile-full", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      closeModal();
      showMessage("Saved successfully!", "success");
    } catch (err) {
      showMessage(err.response?.data?.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSave = () => {
    if (!photoFile) { closeModal(); return; }
    handleSave({}, { profilePhoto: photoFile });
  };

  const handleResumeSave = () => {
    if (!resumeFile) { closeModal(); return; }
    handleSave({}, { resume: resumeFile });
  };

  if (!user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  const sections = user.role === "jobseeker" ? [
    { label: "Resume", key: "resume" },
    { label: "Resume Headline", key: "headline" },
    { label: "Key Skills", key: "skills" },
    { label: "Employment", key: "experience" },
    { label: "Education", key: "education" },
    { label: "Personal Details", key: "personal" },
  ] : [
    { label: "About", key: "about" },
    { label: "Company Details", key: "company" },
    { label: "Account Stats", key: "stats" },
  ];

  const uploadedDate = user.resumeUploadedAt
    ? new Date(user.resumeUploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Global message ── */}
        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-rose-50 text-rose-700 border-rose-100"}`}>
            <span className="mr-2">{message.type === "success" ? "✓" : "⚠"}</span>
            {message.text}
          </div>
        )}

        {/* ── HEADER CARD ── */}
        <div className="clean-card p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* ── Photo upload zone ── */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar src={photoPreview} name={user.name} size="xl"
                  className="ring-4 ring-slate-100 shadow-sm" />
                {/* Visible camera badge */}
                <button
                  type="button"
                  onClick={() => openModal("photo")}
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all"
                  title="Change profile photo"
                >
                  {Ico.camera}
                </button>
              </div>
              <button
                type="button"
                onClick={() => openModal("photo")}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                {Ico.camera}
                Change photo
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <button onClick={() => openModal("personal")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  {Ico.pencil} Edit
                </button>
              </div>
              <p className="text-xs font-medium text-slate-400 mb-6">
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-12">
                <InfoRow icon={Ico.pin} text={user.address || "Location not set"} />
                <InfoRow icon={Ico.phone} text={user.mobileNumber || "Mobile not set"} />
                {user.role === "jobseeker" && (
                  <>
                    <InfoRow icon={Ico.briefcase} text={user.totalExperience ? `${user.totalExperience} Experience` : "Experience not set"} />
                    <InfoRow icon={Ico.mail} text={user.email} />
                    <InfoRow icon={Ico.currency} text={user.currentSalary ? `₹ ${user.currentSalary}` : "Salary not set"} />
                    <InfoRow icon={Ico.clock} text={user.availableToJoin ? `Available in ${user.availableToJoin}` : "Availability not set"} />
                  </>
                )}
                {user.role === "recruiter" && (
                  <>
                    <InfoRow icon={Ico.mail} text={user.email} />
                    <InfoRow icon={Ico.building} text={user.companyName || "Company not set"} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:w-48 shrink-0 clean-card p-5 sticky top-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Quick links</p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.key}>
                  <a href={`#section-${s.key}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-medium transition-all group">
                    <span>{s.label}</span>
                    {((s.key === "experience" && (!user.experience || user.experience.length === 0)) ||
                      (s.key === "education" && (!user.education || user.education.length === 0))) && (
                        <span className="text-indigo-500 font-bold text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
                      )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Resume Section */}
            {user.role === "jobseeker" && (
              <SectionCard id="section-resume" title="Resume" icon={Ico.pdf}
                action={<EditBtn onClick={() => openModal("resume")} label="Update" />}>
                {user.resume ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {user.resumeOriginalName || "resume.pdf"}
                        </p>
                        {uploadedDate && (
                          <p className="text-xs text-slate-400">Uploaded on {uploadedDate}</p>
                        )}
                      </div>
                    </div>
                    <a href={`${BACKEND_URL}${user.resume}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                      {Ico.download} Download
                    </a>
                  </div>
                ) : null}

                {/* Upload zone */}
                <label htmlFor="resume-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                  <button type="button" onClick={() => openModal("resume")}
                    className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors">
                    {user.resume ? "Update resume" : "Upload resume"}
                  </button>
                  <p className="text-xs text-slate-400 mt-2">Supported Formats: pdf · Max 2 MB</p>
                </label>
              </SectionCard>
            )}

            {/* Resume Headline */}
            {user.role === "jobseeker" && (
              <SectionCard id="section-headline" title="Resume Headline" icon={Ico.resume}
                action={<EditBtn onClick={() => openModal("headline")} />}>
                {user.resumeHeadline ? (
                  <p className="text-slate-600 leading-relaxed text-sm">{user.resumeHeadline}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Add a headline — e.g. "React Developer with 2+ years of experience"
                  </p>
                )}
              </SectionCard>
            )}

            {/* Key Skills */}
            {user.role === "jobseeker" && (
              <SectionCard id="section-skills" title="Key Skills" icon={Ico.skills}
                action={<EditBtn onClick={() => openModal("skills")} />}>
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((s, i) => (
                      <span key={i}
                        className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <button type="button" onClick={() => openModal("skills")}
                    className="text-sm text-indigo-600 font-bold hover:underline">
                    + Add key skills
                  </button>
                )}
              </SectionCard>
            )}

            {/* Employment / Experience */}
            {user.role === "jobseeker" && (
              <SectionCard id="section-experience" title="Employment" icon={Ico.work}
                action={
                  <button type="button" onClick={() => {
                    setDraft({ ...user, experience: [...(user.experience || []), { company: "", role: "", duration: "", description: "" }] });
                    setActiveModal("experience");
                  }}
                    className="text-indigo-600 font-bold text-sm hover:underline">
                    + Add experience
                  </button>
                }>
                {user.experience && user.experience.length > 0 ? (
                  <div className="divide-y divide-slate-100 space-y-4">
                    {user.experience.map((exp, i) => (
                      <div key={i} className={`flex gap-4 ${i > 0 ? "pt-4" : ""}`}>
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm">{exp.role}</p>
                              <p className="font-semibold text-slate-700 text-sm">{exp.company}</p>
                              <p className="text-xs text-indigo-400 font-bold mt-0.5">{exp.duration}</p>
                            </div>
                            <button type="button" onClick={() => { setDraft({ ...user }); setActiveModal("experience"); }}
                              className="text-slate-400 hover:text-indigo-500 shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                          {exp.description && (
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No employment added yet.</p>
                )}
              </SectionCard>
            )}

            {/* Education */}
            {user.role === "jobseeker" && (
              <SectionCard id="section-education" title="Education" icon={Ico.edu}
                action={
                  <button type="button" onClick={() => {
                    setDraft({ ...user, education: [...(user.education || []), { institution: "", degree: "", year: "" }] });
                    setActiveModal("education");
                  }}
                    className="text-indigo-600 font-bold text-sm hover:underline">
                    + Add education
                  </button>
                }>
                {user.education && user.education.length > 0 ? (
                  <div className="space-y-5">
                    {user.education.map((edu, i) => (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{edu.degree}</p>
                          <p className="text-sm text-slate-600">{edu.institution}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{edu.year}</p>
                        </div>
                        <button type="button" onClick={() => { setDraft({ ...user }); setActiveModal("education"); }}
                          className="text-slate-400 hover:text-indigo-500 shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No education added yet.</p>
                )}
              </SectionCard>
            )}

            {/* ── RECRUITER SECTIONS ── */}

            {/* About / Bio */}
            {user.role === "recruiter" && (
              <SectionCard id="section-about" title="About" icon={Ico.person}
                action={<EditBtn onClick={() => openModal("personal")} />}>
                {user.bio ? (
                  <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{user.bio}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-3">
                      {Ico.person}
                    </div>
                    <p className="text-sm text-slate-400 italic mb-3">Add a short bio about yourself and your hiring focus.</p>
                    <button type="button" onClick={() => openModal("personal")}
                      className="text-xs font-bold text-indigo-600 hover:underline">
                      + Add Bio
                    </button>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Company Details (Recruiter) — redesigned */}
            {user.role === "recruiter" && (
              <SectionCard id="section-company" title="Company Details" icon={Ico.building}
                action={<EditBtn onClick={() => openModal("company")} />}>
                {user.companyName ? (
                  <div className="space-y-0 divide-y divide-slate-50">
                    {/* Company logo placeholder + name */}
                    <div className="flex items-center gap-4 pb-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl font-extrabold text-indigo-400 shrink-0 select-none">
                        {(user.companyName || "C").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-slate-900 leading-tight">{user.companyName}</p>
                        {user.companyAddress && (
                          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                            {Ico.pin}{user.companyAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Meta rows */}
                    <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.companyIndustry && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">{Ico.industry}</div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industry</p>
                            <p className="text-sm font-semibold text-slate-800">{user.companyIndustry}</p>
                          </div>
                        </div>
                      )}
                      {user.companySize && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">{Ico.users}</div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Size</p>
                            <p className="text-sm font-semibold text-slate-800">{user.companySize}</p>
                          </div>
                        </div>
                      )}
                      {user.companyWebsite && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">{Ico.globe}</div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website</p>
                            <a href={user.companyWebsite} target="_blank" rel="noreferrer"
                              className="text-sm font-semibold text-indigo-600 hover:underline truncate block">
                              {user.companyWebsite.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-3">
                      {Ico.building}
                    </div>
                    <p className="text-sm text-slate-400 italic mb-3">Add your company information so candidates know who they're applying to.</p>
                    <button type="button" onClick={() => openModal("company")}
                      className="text-xs font-bold text-indigo-600 hover:underline">
                      + Add Company Details
                    </button>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Account Stats (Recruiter) */}
            {user.role === "recruiter" && (
              <SectionCard id="section-stats" title="Account Stats" icon={Ico.chart}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-center">
                    <p className="text-3xl font-extrabold text-indigo-600">
                      {jobsPosted !== null ? jobsPosted : "–"}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Jobs Posted</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-3xl font-extrabold text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Member Since</p>
                  </div>
                </div>
              </SectionCard>
            )}

          </div>{/* end main */}
        </div>{/* end two-col */}
      </div>{/* end max-w */}

      {/* ═══════════════════ MODALS ═══════════════════ */}

      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* ── Photo modal ── */}
            {activeModal === "photo" && (
              <ModalShell title="Update Profile Photo" onClose={closeModal}
                onSave={handlePhotoSave} loading={loading}>
                <div className="space-y-5">
                  {/* Preview */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <Avatar src={photoPreview} name={user.name} size="xl" className="ring-4 ring-slate-100 shadow" />
                      {photoFile && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Upload area */}
                  <label htmlFor="photo-file-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/20 transition-all gap-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      {Ico.camera}
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      {photoFile ? photoFile.name : "Click to choose a photo"}
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG · Max 1 MB</p>
                  </label>
                  <input id="photo-file-input" type="file" ref={photoInputRef}
                    onChange={handlePhotoChange} className="hidden" accept="image/*" />
                  {photoError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                      <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <p className="text-rose-600 text-sm font-semibold">{photoError}</p>
                    </div>
                  )}
                </div>
              </ModalShell>
            )}

            {/* ── Resume modal ── */}
            {activeModal === "resume" && (
              <ModalShell title="Update Resume" onClose={closeModal}
                onSave={handleResumeSave} loading={loading}>
                <label htmlFor="resume-file-input"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {resumeFile ? resumeFile.name : "Click to upload PDF resume"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF only · Max 2 MB</p>
                  <input id="resume-file-input" type="file" ref={resumeInputRef}
                    onChange={handleResumeChange} className="hidden" accept=".pdf" />
                </label>
                {resumeError && <p className="mt-3 text-rose-500 text-sm font-semibold">⚠ {resumeError}</p>}
                {resumeFile && !resumeError && (
                  <p className="mt-3 text-emerald-600 text-sm font-semibold">✓ {resumeFile.name}</p>
                )}
              </ModalShell>
            )}

            {/* ── Headline modal ── */}
            {activeModal === "headline" && (
              <ModalShell title="Resume Headline" onClose={closeModal}
                onSave={() => handleSave()} loading={loading}>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Headline
                </label>
                <textarea rows="4" value={draft.resumeHeadline || ""}
                  onChange={(e) => setDraft({ ...draft, resumeHeadline: e.target.value })}
                  placeholder='e.g. "React Developer with 2+ years of experience in..."'
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" />
              </ModalShell>
            )}

            {/* ── Skills modal ── */}
            {activeModal === "skills" && (
              <ModalShell title="Key Skills" onClose={closeModal}
                onSave={() => handleSave()} loading={loading}>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                    Skills (one per line)
                  </label>
                  {/* <textarea rows="6" value={(draft.skills || []).join("\n")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      skills: e.target.value
                        .split(/[\n,]/) // split by newline OR comma
                        .map((s) => s.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder={"Python\nJavaScript\nReact\nSQL Server"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" /> */}
                  <textarea
                    rows="6"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder={"Python\nJavaScript\nReact\nSQL Server"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                  />
                  {draft.skills && draft.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {draft.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </ModalShell>
            )}

            {/* ── Personal details modal ── */}
            {activeModal === "personal" && (
              <ModalShell title="Personal Details" onClose={closeModal}
                onSave={() => handleSave()} loading={loading}>
                <div className="space-y-4">
                  {[{ label: "Full Name", key: "name" }, { label: "Mobile", key: "mobileNumber" }, { label: "Location / Address", key: "address" }].map(({ label, key }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</label>
                      <input value={draft[key] || ""}
                        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" />
                    </div>
                  ))}
                  {/* Bio — for recruiter only */}
                  {user.role === "recruiter" && (
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">About / Bio</label>
                      <textarea rows="4" value={draft.bio || ""}
                        onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                        placeholder="e.g. I am a senior HR professional at Acme Corp focused on hiring top engineering talent..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Gender</label>
                    <select value={draft.gender || ""}
                      onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 transition-all">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {/* Jobseeker-only fields */}
                  {user.role === "jobseeker" && (
                    <div className="grid grid-cols-2 gap-4">
                      {[{ label: "Experience (e.g. 2 Years)", key: "totalExperience" }, { label: "Current Salary (₹)", key: "currentSalary" }, { label: "Available to Join (e.g. 15 Days)", key: "availableToJoin" }].map(({ label, key }) => (
                        <div key={key} className="space-y-1 col-span-2 sm:col-span-1">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</label>
                          <input value={draft[key] || ""}
                            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ModalShell>
            )}

            {/* ── Experience modal ── */}
            {activeModal === "experience" && (
              <ModalShell title="Employment History" onClose={closeModal}
                onSave={() => handleSave()} loading={loading}>
                <div className="space-y-6">
                  {(draft.experience || []).map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-black text-slate-400 uppercase">Company</label>
                          <input value={exp.company}
                            onChange={(e) => {
                              const arr = [...draft.experience]; arr[idx] = { ...arr[idx], company: e.target.value };
                              setDraft({ ...draft, experience: arr });
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-400 uppercase">Role / Title</label>
                          <input value={exp.role}
                            onChange={(e) => {
                              const arr = [...draft.experience]; arr[idx] = { ...arr[idx], role: e.target.value };
                              setDraft({ ...draft, experience: arr });
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-400 uppercase">Duration</label>
                          <input placeholder="Jun 2022 – Present" value={exp.duration}
                            onChange={(e) => {
                              const arr = [...draft.experience]; arr[idx] = { ...arr[idx], duration: e.target.value };
                              setDraft({ ...draft, experience: arr });
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-black text-slate-400 uppercase">Description</label>
                          <textarea rows="3" value={exp.description}
                            onChange={(e) => {
                              const arr = [...draft.experience]; arr[idx] = { ...arr[idx], description: e.target.value };
                              setDraft({ ...draft, experience: arr });
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none resize-none" />
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => setDraft({ ...draft, experience: draft.experience.filter((_, i) => i !== idx) })}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700">
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => setDraft({ ...draft, experience: [...(draft.experience || []), { company: "", role: "", duration: "", description: "" }] })}
                    className="text-indigo-600 text-sm font-bold hover:underline">
                    + Add another
                  </button>
                </div>
              </ModalShell>
            )}

            {/* ── Education modal ── */}
            {activeModal === "education" && (
              <ModalShell title="Education" onClose={closeModal}
                onSave={() => handleSave()} loading={loading}>
                <div className="space-y-5">
                  {(draft.education || []).map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase">Institution</label>
                        <input value={edu.institution}
                          onChange={(e) => {
                            const arr = [...draft.education]; arr[idx] = { ...arr[idx], institution: e.target.value };
                            setDraft({ ...draft, education: arr });
                          }}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-400 uppercase">Degree</label>
                          <input value={edu.degree}
                            onChange={(e) => {
                              const arr = [...draft.education]; arr[idx] = { ...arr[idx], degree: e.target.value };
                              setDraft({ ...draft, education: arr });
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-400 uppercase">Year</label>
                          <input placeholder="2018-2022" value={edu.year}
                            onChange={(e) => {
                              const arr = [...draft.education]; arr[idx] = { ...arr[idx], year: e.target.value };
                              setDraft({ ...draft, education: arr });
                            }}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => setDraft({ ...draft, education: draft.education.filter((_, i) => i !== idx) })}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700">
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => setDraft({ ...draft, education: [...(draft.education || []), { institution: "", degree: "", year: "" }] })}
                    className="text-indigo-600 text-sm font-bold hover:underline">
                    + Add another
                  </button>
                </div>
              </ModalShell>
            )}

            {/* ── Company details modal (recruiter) — enhanced ── */}
            {activeModal === "company" && (
              <ModalShell title="Company Details" onClose={closeModal}
                onSave={() => handleSave()} loading={loading}>
                <div className="space-y-4">
                  {[
                    { label: "Company Name", key: "companyName", placeholder: "e.g. Acme Technologies" },
                    { label: "Company Address", key: "companyAddress", placeholder: "e.g. Mumbai, Maharashtra" },
                    { label: "Industry", key: "companyIndustry", placeholder: "e.g. Information Technology" },
                    { label: "Company Size", key: "companySize", placeholder: "e.g. 51–200 employees" },
                    { label: "Website", key: "companyWebsite", placeholder: "https://www.example.com" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</label>
                      <input value={draft[key] || ""} placeholder={placeholder}
                        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" />
                    </div>
                  ))}
                </div>
              </ModalShell>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// ── Shared modal shell ────────────────────────────────────────────────────────
const ModalShell = ({ title, onClose, onSave, loading, children }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between p-6 border-b border-slate-100">
      <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div className="p-6 flex-1">{children}</div>
    <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
      <button onClick={onClose}
        className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">
        Cancel
      </button>
      <button onClick={onSave} disabled={loading}
        className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-lg shadow-indigo-100">
        {loading ? "Saving…" : "Save"}
      </button>
    </div>
  </div>
);

export default Profile;
