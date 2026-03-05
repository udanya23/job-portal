import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <Router>
      <Routes>

        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ---------------- PROTECTED ROUTES ---------------- */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-applications" element={<MyApplications />} />
          {/* <Route path="/post-job" element={<PostJob />} /> */}
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/jobs/:id/edit" element={<PostJob />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/jobs/:jobId/applicants" element={<JobApplicants />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
