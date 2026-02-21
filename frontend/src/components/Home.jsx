// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";

// const Home = () => {
//     const [user, setUser] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const storedUser = localStorage.getItem("user");
//         if (storedUser) {
//             setUser(JSON.parse(storedUser));
//         }
//     }, []);

//     if (!user) return null;

//     const stats = user.role === "recruiter"
//         ? [
//             {
//                 label: "Active Job Posts", value: "0", icon: (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                     </svg>
//                 ), color: "bg-indigo-50 text-indigo-600"
//             },
//             {
//                 label: "Total Applicants", value: "0", icon: (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                 ), color: "bg-purple-50 text-purple-600"
//             },
//             {
//                 label: "Pending Reviews", value: "0", icon: (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                     </svg>
//                 ), color: "bg-amber-50 text-amber-600"
//             }
//         ]
//         : [
//             {
//                 label: "Applications Sent", value: "0", icon: (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                 ), color: "bg-emerald-50 text-emerald-700"
//             },
//             {
//                 label: "Saved Jobs", value: "0", icon: (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
//                     </svg>
//                 ), color: "bg-indigo-50 text-indigo-600"
//             },
//             {
//                 label: "Profile Views", value: "0", icon: (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                 ), color: "bg-rose-50 text-rose-600"
//             }
//         ];

//     return (
//         <div className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900">
//             <div className="max-w-6xl mx-auto space-y-10">

//                 {/* Simplified Hero Header */}
//                 <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
//                         <div className="flex-1">
//                             <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 ${user.role === "recruiter" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
//                                 }`}>
//                                 {user.role} Dashboard
//                             </span>
//                             <h1 className="text-4xl font-black text-slate-900 leading-tight">
//                                 Hello, <span className="text-indigo-600">{user.name}</span>! 👋
//                             </h1>
//                             <p className="text-slate-500 mt-4 text-lg font-medium max-w-xl">
//                                 {user.role === "recruiter"
//                                     ? "Find top talent and manage your job listings from your central hub."
//                                     : "Keep your career journey organized. Track applications and explore new roles."}
//                             </p>
//                         </div>

//                         <div className="flex flex-wrap gap-4">
//                             {user.role === "recruiter" ? (
//                                 <button className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
//                                     Post New Job
//                                 </button>
//                             ) : (
//                                 <button className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
//                                     Browse Jobs
//                                 </button>
//                             )}
//                             <Link to="/profile" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition">
//                                 My Profile
//                             </Link>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Stats Section */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {stats.map((stat, i) => (
//                         <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
//                             <div className={`w-10 h-10 rounded-2xl ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
//                                 {stat.icon}
//                             </div>
//                             <h3 className="text-slate-400 font-black text-xs tracking-widest uppercase">{stat.label}</h3>
//                             <p className="text-4xl font-black mt-2 text-slate-900">{stat.value}</p>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Activity Feed Only - Keeps it clean */}
//                 <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
//                     <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
//                         <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
//                         Recent Notifications
//                     </h2>
//                     <div className="space-y-4">
//                         {[1, 2].map((_, i) => (
//                             <div key={i} className="flex gap-4 items-start p-5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition">
//                                 <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
//                                     <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                 </div>
//                                 <div className="flex-1">
//                                     <div className="flex justify-between items-start">
//                                         <p className="text-sm font-black text-slate-900">Platform Update</p>
//                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2h ago</p>
//                                     </div>
//                                     <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
//                                         We've refreshed your dashboard UI for a cleaner and more professional experience.
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//             </div>

//             <p className="mt-16 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
//                 CareerLink Dashboard &copy; {new Date().getFullYear()}
//             </p>
//         </div>
//     );
// };

// export default Home;



import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const Home = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(JSON.parse(storedUser));
    }, [navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (user.role === "recruiter") {
                    const res = await axios.get("/jobs");
                    const myJobs = res.data.filter(j => j.recruiter._id === user.id);
                    // This is a bit simplified, ideally backend should provide these stats
                    setStats([
                        { label: "Active Job Posts", value: myJobs.length.toString() },
                        { label: "Total Applicants", value: "0" }, // Need application count per job
                        { label: "Pending Reviews", value: "0" }
                    ]);
                } else {
                    const res = await axios.get("/applications/my-applications");
                    setStats([
                        { label: "Applications Sent", value: res.data.length.toString() },
                        { label: "Saved Jobs", value: "0" },
                        { label: "Profile Views", value: "0" }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (!user || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const isRecruiter = user.role === "recruiter";

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Hero Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <span
                                className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 
                                ${isRecruiter
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-emerald-100 text-emerald-700"}`}
                            >
                                {user.role} Dashboard
                            </span>

                            <h1 className="text-4xl font-black">
                                Welcome back,{" "}
                                <span className="text-indigo-600">
                                    {user.name}
                                </span> 👋
                            </h1>

                            <p className="text-slate-500 mt-4 text-lg max-w-xl">
                                {isRecruiter
                                    ? "Manage your job postings and review applicants efficiently."
                                    : "Track your applications and explore new job opportunities."}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {isRecruiter ? (
                                <Link
                                    to="/post-job"
                                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition shadow-md"
                                >
                                    Post New Job
                                </Link>
                            ) : (
                                <Link
                                    to="/jobs"
                                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition shadow-md"
                                >
                                    Browse Jobs
                                </Link>
                            )}

                            <Link
                                to="/profile"
                                className="px-8 py-3 bg-white border border-slate-200 font-semibold rounded-2xl hover:bg-slate-50 transition"
                            >
                                My Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition"
                        >
                            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                {stat.label}
                            </h3>
                            <p className="text-4xl font-black mt-2">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold mb-6">
                        Recent Notifications
                    </h2>

                    <div className="space-y-4">
                        <div className="p-5 bg-slate-50 rounded-2xl text-sm text-slate-600">
                            {isRecruiter
                                ? "You have 0 new applicants for your active job posts."
                                : "Check out the latest job openings matching your profile!"}
                        </div>
                    </div>
                </div>
            </div>


            <p className="mt-16 text-center text-xs text-slate-400">
                CareerLink Dashboard © {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default Home;
