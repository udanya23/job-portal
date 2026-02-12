import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [role, setRole] = useState('jobseeker');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const API_URL = 'http://localhost:5000/api/auth';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    // Helper function to display messages with auto-dismiss
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: formData.email,
                password: formData.password,
                role: role
            });

            // Store token and user info in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            showMessage(response.data.message, 'success');

            // Reload to show home page
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } catch (error) {
            showMessage(error.response?.data?.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-md w-full transform transition-all hover:scale-[1.01] duration-300">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                    Welcome Back!
                </h1>
                <p className="text-gray-600 text-center mb-8 text-sm">
                    Login to access your dashboard
                </p>

                {/* Role Selection */}
                {/* <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Role *
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="role"
                                value="jobseeker"
                                checked={role === 'jobseeker'}
                                onChange={handleRoleChange}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="ml-2 text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">Job Seeker</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="role"
                                value="recruiter"
                                checked={role === 'recruiter'}
                                onChange={handleRoleChange}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="ml-2 text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">Recruiter</span>
                        </label>
                    </div>
                </div> */}

                {/* Message Display */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${message.type === 'success'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg mt-2"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="text-center mt-4 text-sm text-gray-600">
                    <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:underline hover:text-indigo-700 transition-colors">
                        Forgot Password?
                    </Link>
                </div>

                <div className="text-center mt-6 text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 font-bold hover:underline hover:text-indigo-700 transition-colors">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
