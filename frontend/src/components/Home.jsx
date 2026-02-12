import { useState, useEffect } from 'react';

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white border border-gray-300 rounded p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome, {user.name}!
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Profile</h2>

                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-600">Role:</span>
                                <span className="ml-2 text-sm text-gray-800 capitalize">{user.role}</span>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-600">Email:</span>
                                <span className="ml-2 text-sm text-gray-800">{user.email}</span>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-gray-600">Mobile:</span>
                                <span className="ml-2 text-sm text-gray-800">{user.mobileNumber}</span>
                            </div>

                            {user.role === 'jobseeker' && (
                                <>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Address:</span>
                                        <span className="ml-2 text-sm text-gray-800">{user.address}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Gender:</span>
                                        <span className="ml-2 text-sm text-gray-800">{user.gender}</span>
                                    </div>
                                </>
                            )}

                            {user.role === 'recruiter' && (
                                <>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Company:</span>
                                        <span className="ml-2 text-sm text-gray-800">{user.companyName}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Company Address:</span>
                                        <span className="ml-2 text-sm text-gray-800">{user.companyAddress}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-gray-700">
                            <strong>Note:</strong> You are now logged in! This is a simple dashboard showing your profile information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
