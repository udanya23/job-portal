import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const categories = [
    { name: 'Remote', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'MNC', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Fortune 500', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { name: 'Data Science', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Software Dev', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { name: 'Marketing', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { name: 'Internship', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' },
    { name: 'HR', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Sales', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Fresher', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
];

const faqs = [
    { q: 'How does CareerLink help me find the right job?', a: 'Our smart matching algorithm analyzes your skills and preferences to surface roles that truly fit your career goals, reducing the noise of traditional job boards.' },
    { q: 'Is my personal data secure on CareerLink?', a: 'Absolutely. We prioritize your privacy with end-to-end encryption and give you full control over who can view your profile and resume.' },
    { q: 'Are there any fees for job seekers?', a: 'Searching and applying for jobs on CareerLink is completely free. We offer premium tools for those who want extra features like profile boosts.' },
    { q: 'How quickly can I expect responses from recruiters?', a: 'Response times vary by company, but our platform sends instant alerts to recruiters when you apply. Most active recruiters respond within 1–3 business days.' },
];

const stats = [
    { value: '50K+', label: 'Active Jobs' },
    { value: '12K+', label: 'Companies' },
    { value: '200K+', label: 'Job Seekers' },
    { value: '95%', label: 'Satisfaction' },
];

const LandingPage = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}&filter=1` : ''}`);
    };

    return (
        <div className="min-h-screen bg-white">

            {/* ── HERO ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#eef4f0] border-b border-[#c5ddd0]/60 px-5 pt-20 pb-24">

                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#1a5c40]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-3xl mx-auto text-center">
                    {/* Live pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#b2d8c4] rounded-full text-xs font-semibold text-slate-600 mb-8 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#1a5c40] animate-pulse shrink-0" />
                        4,000+ remote jobs added this week
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.08] mb-5">
                        Find your{' '}
                        <span className="text-[#1a5c40]">dream career</span>
                        <br />with CareerLink
                    </h1>

                    <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
                        Connecting ambition with opportunity. Your next great career move starts with a simple search.
                    </p>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-xl mx-auto bg-white border border-slate-200 rounded-xl p-2 shadow-md shadow-slate-900/5">
                        <svg className="w-4 h-4 text-slate-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400 px-2 font-medium"
                            placeholder="Search for jobs, skills, or companies..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn-primary py-2 px-5 text-sm">
                            Search
                        </button>
                    </form>

                    <p className="text-xs text-slate-400 mt-4">
                        Popular: <button onClick={() => navigate('/jobs?q=React&filter=1')} className="text-slate-600 hover:text-[#1a5c40] transition-colors font-medium">React</button>,{' '}
                        <button onClick={() => navigate('/jobs?q=Python&filter=1')} className="text-slate-600 hover:text-[#1a5c40] transition-colors font-medium">Python</button>,{' '}
                        <button onClick={() => navigate('/jobs?q=Remote&filter=1')} className="text-slate-600 hover:text-[#1a5c40] transition-colors font-medium">Remote</button>
                    </p>
                </div>

                {/* Stats Row */}
                <div className="relative max-w-2xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CATEGORIES ─────────────────────────────────────── */}
            <section id="categories" className="px-5 py-20 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="section-label mb-3">Browse by category</p>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Explore opportunities</h2>
                    <p className="text-sm text-slate-500">Thousands of jobs across every industry and skill level</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2.5">
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(`/jobs?q=${encodeURIComponent(cat.name)}&filter=1`)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-[#b2d8c4] hover:text-[#1a5c40] hover:bg-[#e8f5ee]/60 transition-all duration-150 shadow-sm group"
                            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                        >
                            <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-[#d4f0e0] group-hover:text-[#1a5c40] group-hover:border-[#b2d8c4] transition-all duration-150">
                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon} />
                                </svg>
                            </span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <section className="bg-white border-y border-slate-200/60 px-5 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="section-label mb-3">How it works</p>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Get hired in 3 steps</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: '01', title: 'Create Profile', desc: 'Sign up and build your professional profile with your skills, experience, and resume in minutes.' },
                            { step: '02', title: 'Discover Jobs', desc: 'Browse thousands of curated job listings filtered by role, location, salary, and experience level.' },
                            { step: '03', title: 'Apply & Track', desc: 'Submit applications with one click and track every stage from Applied to Accepted in real-time.' },
                        ].map((item) => (
                            <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <div className="text-xs font-bold text-[#1a5c40] mb-3">{item.step}</div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQS ──────────────────────────────────────────── */}
            <section id="faqs" className="px-5 py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="section-label mb-3">FAQ</p>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Common questions</h2>
                        <p className="text-sm text-slate-500">Everything you need to know about CareerLink</p>
                    </div>
                    <div className="space-y-2.5">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                                >
                                    {faq.q}
                                    <svg
                                        className={`w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4 animate-slide-down">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────── */}
            <section className="px-5 pb-20">
                <div className="max-w-4xl mx-auto bg-[#1a5c40] rounded-2xl px-10 py-16 text-center relative overflow-hidden">
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(165,180,252,0.3) 0%, transparent 60%)' }} />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                            Ready to take the next step?
                        </h2>
                        <p className="text-[#a8d4bc] text-base mb-8 max-w-md mx-auto leading-relaxed">
                            Join thousands of professionals finding their best work on CareerLink. Start your journey today.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link to="/register" className="px-6 py-3 bg-white text-[#1a5c40] text-sm font-bold rounded-xl hover:bg-[#e8f5ee] transition-colors shadow-lg">
                                Get Started for Free
                            </Link>
                            <Link to="/login" className="px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────── */}
            <footer className="border-t border-slate-200 bg-white px-5 pt-12 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 bg-[#1a5c40] rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-bold text-slate-900">CareerLink</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">
                                Empowering the world's workforce with smarter job matching.
                            </p>
                        </div>
                        {[
                            { title: 'For Candidates', links: ['Browse Jobs', 'Resume Tips', 'Career Advice'] },
                            { title: 'For Employers', links: ['Post a Job', 'Hiring Solutions', 'Pricing'] },
                            { title: 'Company', links: ['About Us', 'Blog', 'Privacy', 'Terms'] },
                        ].map(col => (
                            <div key={col.title}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{col.title}</p>
                                <div className="space-y-2.5">
                                    {col.links.map(l => (
                                        <a key={l} href="#" className="block text-sm text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-xs text-slate-400">© {new Date().getFullYear()} CareerLink. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Privacy</a>
                            <a href="#" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
