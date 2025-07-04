import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Dashboard.css";

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const lastLogin = localStorage.getItem("lastLogin"); 

  return (
    <div className="dashboard-container">
      <h1>Patient Dashboard</h1>

      {user ? (
        <div className="profile-card">
          <h2>Profile Details:</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Last Logged In:</strong> {lastLogin}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default PatientDashboard;
