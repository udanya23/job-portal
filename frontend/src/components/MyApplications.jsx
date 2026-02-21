import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";

const MyApplications = () => {
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get("/applications/my-applications");
                setApplications(res.data);
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === "jobseeker") {
            fetchApplications();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Tracking {applications.length} active job applications.</p>
                    </div>
                    <Link to="/home" className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-sm">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse More Jobs
                    </Link>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
                        <p className="text-slate-500 mb-8">You haven't applied to any jobs yet. Start your career journey today!</p>
                        <Link to="/home" className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                            Explore Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Job Information</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Applied</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {applications.map((app) => (
                                        <tr key={app._id} className="group hover:bg-slate-50/50 transition">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{app.job?.title || "Job Unavailable"}</p>
                                                        <p className="text-sm text-slate-500 mt-0.5">{app.job?.companyName || "Unknown Company"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-600 font-medium whitespace-nowrap">
                                                {new Date(app.appliedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold 
                                                    ${app.status === 'Applied' ? 'bg-emerald-100 text-emerald-700' :
                                                        app.status === 'Interviewing' ? 'bg-indigo-100 text-indigo-700' :
                                                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                                'bg-slate-100 text-slate-700'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full 
                                                        ${app.status === 'Applied' ? 'bg-emerald-500' :
                                                            app.status === 'Interviewing' ? 'bg-indigo-500' :
                                                                app.status === 'Rejected' ? 'bg-rose-500' :
                                                                    'bg-slate-500'}`}></div>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-sm font-bold text-slate-400 hover:text-slate-900 transition">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {user.role === "recruiter" && (
                    <div className="mt-12 p-8 rounded-3xl bg-indigo-50 border border-indigo-100 md:flex items-center justify-between gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-indigo-900">Are you a Recruiter?</h3>
                            <p className="text-indigo-700/70 mt-1 max-w-sm">Use the Recruiter Dashboard to manage applicants for your posted jobs.</p>
                        </div>
                        <Link to="/home" className="mt-4 md:mt-0 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 whitespace-nowrap">
                            Switch to Dashboard
                        </Link>
                    </div>
                )}
            </div>

            <p className="mt-16 text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} CareerLink. All rights reserved.
            </p>
        </div>
    );
};

export default MyApplications;
