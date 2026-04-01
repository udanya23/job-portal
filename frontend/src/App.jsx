import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Profile from "./components/Profile";
import MyApplications from "./components/MyApplications";
import PostJob from "./components/PostJob";
import JobList from "./components/JobList";
import JobDetails from "./components/JobDetails";
import JobApplicants from "./components/JobApplicants";
import AllApplicants from "./components/AllApplicants";
import Interviews from "./components/Interviews";
import LandingPage from "./components/Landingpage";
import SavedJobs from "./components/SavedJobs";

function App() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <Router>
      <Routes>

        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/home" replace />
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Auth pages — redirect to /home if already logged in */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/home" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/home" replace /> : <Register />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/jobs/:id/edit" element={<PostJob />} />
            <Route path="/jobs/:jobId/applicants" element={<JobApplicants />} />
            <Route path="/applicants" element={<AllApplicants />} />
            <Route path="/interviews" element={<Interviews />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
