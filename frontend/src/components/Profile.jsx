import { useEffect, useState, useRef } from "react";
import axios from "../api/axiosInstance";
import Avatar from "./Avatar";

const BACKEND_URL = "http://localhost:5000";

// ── tiny helpers ──────────────────────────────────────────────────────────────
const InfoRow = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-slate-600">
    <span className="text-slate-400">{icon}</span>
    <span>{text}</span>
  </div>
);

const SectionCard = ({ id, title, action, children }) => (
  <div id={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const EditBtn = ({ onClick, label = "Edit" }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1 transition-colors"
  >
    ✏ {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Active modal: null | 'photo' | 'resume' | 'headline' | 'skills' | 'education' | 'experience' | 'personal'
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/auth/profile");
        setUser(res.data);
        if (res.data.profilePhoto) setPhotoPreview(`${BACKEND_URL}${res.data.profilePhoto}`);
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
      const data = new FormData();

      const textFields = [
        "name", "mobileNumber", "address", "gender", "bio",
        "resumeHeadline", "currentSalary", "totalExperience", "availableToJoin"
      ];
      textFields.forEach((k) => { if (draft[k] !== undefined) data.append(k, draft[k] || ""); });

      if (draft.education) data.append("education", JSON.stringify(draft.education));
      if (draft.experience) data.append("experience", JSON.stringify(draft.experience));
      if (draft.skills) data.append("skills", JSON.stringify(draft.skills));

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

  const sections = [
    { label: "Resume", key: "resume" },
    { label: "Resume headline", key: "headline" },
    { label: "Key skills", key: "skills" },
    { label: "Employment", key: "experience" },
    { label: "Education", key: "education" },
    { label: "Personal details", key: "personal" },
  ];

  const uploadedDate = user.resumeUploadedAt
    ? new Date(user.resumeUploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Global message ── */}
        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-semibold ${message.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
            {message.text}
          </div>
        )}

        {/* ── HEADER CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative group shrink-0 cursor-pointer" onClick={() => openModal("photo")}>
              <Avatar src={photoPreview} name={user.name} size="xl"
                className="ring-4 ring-indigo-100 shadow-md" />
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-slate-900 truncate">{user.name}</h1>
                <button onClick={() => openModal("personal")}
                  className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Profile last updated — {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                <InfoRow icon="📍" text={user.address || "Location not set"} />
                <InfoRow icon="📞" text={user.mobileNumber || "Mobile not set"} />
                {user.role === "jobseeker" && (
                  <>
                    <InfoRow icon="💼" text={user.totalExperience ? `${user.totalExperience} Experience` : "Experience not set"} />
                    <InfoRow icon="✉️" text={user.email} />
                    <InfoRow icon="💰" text={user.currentSalary ? `₹ ${user.currentSalary}` : "Salary not set"} />
                    <InfoRow icon="📅" text={user.availableToJoin ? `Available in ${user.availableToJoin}` : "Availability not set"} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:w-48 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-8">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick links</p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.key}>
                  <a href={`#section-${s.key}`}
                    className="flex items-center justify-between py-2 text-sm text-slate-700 hover:text-indigo-600 font-medium transition-colors group">
                    <span>{s.label}</span>
                    {((s.key === "experience" && (!user.experience || user.experience.length === 0)) ||
                      (s.key === "education" && (!user.education || user.education.length === 0))) && (
                        <span className="text-indigo-500 font-bold text-xs group-hover:underline">Add</span>
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
              <SectionCard id="section-resume" title="Resume"
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
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                      ⬇ Download
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
              <SectionCard id="section-headline" title="Resume headline"
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
              <SectionCard id="section-skills" title="Key skills"
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
              <SectionCard id="section-experience" title="Employment"
                action={
                  <button type="button" onClick={() => {
                    setDraft({ ...user, experience: [...(user.experience || []), { company: "", role: "", duration: "", description: "" }] });
                    setActiveModal("experience");
                  }}
                    className="text-indigo-600 font-bold text-sm hover:underline">
                    + Add employment
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
              <SectionCard id="section-education" title="Education"
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
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Avatar src={photoPreview} name={user.name} size="xl" className="ring-4 ring-indigo-100" />
                  </div>
                  <label htmlFor="photo-file-input"
                    className="inline-block cursor-pointer px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                    Choose Photo
                  </label>
                  <input id="photo-file-input" type="file" ref={photoInputRef}
                    onChange={handlePhotoChange} className="hidden" accept="image/*" />
                  {photoError && <p className="text-rose-500 text-sm font-semibold">⚠ {photoError}</p>}
                  {photoFile && !photoError && (
                    <p className="text-emerald-600 text-sm font-semibold">✓ {photoFile.name}</p>
                  )}
                  <p className="text-xs text-slate-400">JPG, PNG · Max 1 MB</p>
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
                  <textarea rows="6" value={(draft.skills || []).join("\n")}
                    onChange={(e) => setDraft({ ...draft, skills: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })}
                    placeholder={"Python\nJavaScript\nReact\nSQL Server"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" />
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
