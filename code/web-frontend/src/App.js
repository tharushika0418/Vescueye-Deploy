import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Signup from "./pages/SignUp";
import SignIn from "./pages/SignIn";

import PatientDashboard from "./pages/PatientDashboard";
import PatientRegister from "./pages/PatientRegister";
import PatientSearch from "./pages/PatientSearch";
import AssignPatient from "./pages/AssignPatient";

import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorSearch from "./pages/DoctorSearch";
import FlapSearch from "./pages/FlapSearch";

import HospitalDashboard from "./pages/HospitalDashboard";
import Dashboard from "./pages/Dashboard";
import PatientDetail from "./pages/PatientDetail";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import NotFound from "./pages/NotFound"; // <-- Import the 404 component

import AllPatients from "./pages/AllPatients";
import AllDoctors from "./pages/AllDoctors";

import DischargePatient from "./pages/DischargePatient";

// Protected Route Wrapper
const AuthRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navbar />

          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/register-patient" element={<PatientRegister />} />
              <Route path="/search-patient" element={<PatientSearch />} />
              <Route path="/assign-patient" element={<AssignPatient />} />
              <Route path="/register-doctor" element={<DoctorRegister />} />
              <Route path="/search-doctor" element={<DoctorSearch />} />
              <Route path="/patient/:id" element={<PatientDetail />} />
              <Route path="/all-patients" element={<AllPatients />} />
              <Route path="/all-doctors" element={<AllDoctors />} />

              <Route
                path="/discharge-patient"
                element={
                  <AuthRoute roles={["hospital"]}>
                    <DischargePatient />
                  </AuthRoute>
                }
              />

              {/* Role-based Dashboard Routing */}
              <Route
                path="/dashboard"
                element={
                  <AuthRoute>
                    <Dashboard />
                  </AuthRoute>
                }
              />
              <Route
                path="/patient-dashboard"
                element={
                  <AuthRoute roles={["patient"]}>
                    <PatientDashboard />
                  </AuthRoute>
                }
              />
              <Route
                path="/doctor-dashboard"
                element={
                  <AuthRoute roles={["doctor"]}>
                    <DoctorDashboard />
                  </AuthRoute>
                }
              />
              <Route
                path="/search-flap"
                element={
                  <AuthRoute roles={["doctor"]}>
                    <FlapSearch />
                  </AuthRoute>
                }
              />
              <Route
                path="/hospital-dashboard"
                element={
                  <AuthRoute roles={["hospital"]}>
                    <HospitalDashboard />
                  </AuthRoute>
                }
              />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* 404 catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
