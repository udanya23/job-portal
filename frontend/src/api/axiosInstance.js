import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true // send HTTP-only refresh token cookie on every request
});

// Request interceptor — attach access token from localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh access token on 401
axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(
                    'http://localhost:5000/api/auth/refresh-token',
                    {},
                    { withCredentials: true }
                );
                const newToken = res.data.token;
                localStorage.setItem('token', newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                // Refresh token is expired or invalid — log user out
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
