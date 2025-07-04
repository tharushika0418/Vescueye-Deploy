import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../styles/FlapSearch.css";

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const lastLogin = localStorage.getItem("lastLogin");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const [patientId, setPatientId] = useState("");
  const [flapData, setFlapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to Fetch Flap Data by Patient ID
  const searchFlapData = async () => {
    if (!patientId) {
      setError("Please enter a Patient ID.");
      return;
    }

    setLoading(true);
    setError("");
    setFlapData([]); // Clear previous data before making a new request

    try {
      console.log(`Fetching flap data for Patient ID: ${patientId}`);

      const response = await axios.get(
        `${API_URL}/users/flap/search/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("API Response:", response.data); // Log response

      setFlapData(response.data); //  Update state with flap data
    } catch (err) {
      console.error("API Error:", err); // Log error
      setError(err.response?.data?.error || "Error fetching flap data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Flap Data Section</h1>

      {/* Flap Data Search Section */}
      <div className="search-container">
        <h2>Search Flap Data by Patient ID</h2>
        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button onClick={searchFlapData}>Search</button>
      </div>

      {/* Show Loading State */}
      {loading && <p>Loading flap data...</p>}

      {/* Show Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Show Flap Data in Table Format */}
      {flapData.length > 0 && (
        <div className="table-container">
          <h2>Flap Data Results</h2>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Temperature (°C)</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {flapData.map((flap) => (
                <tr key={flap._id}>
                  <td>
                    <img
                      src={flap.image_url}
                      alt="Flap"
                      width="200" // ✅ Larger Image
                      style={{ maxHeight: "200px", objectFit: "contain" }} // Prevents distortion
                    />
                  </td>
                  <td>{flap.temperature.toFixed(2)}</td>
                  <td>{new Date(flap.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
