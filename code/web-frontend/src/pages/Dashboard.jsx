import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div>
      <h2>Welcome, {user.name || user.email}</h2>
      <p>Your role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
