import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Login User
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, { email, password });

    if (response.data.success && response.data.role === "hospital") {
      localStorage.setItem("hospitalEmail", email); // Store hospital email
    }

    return response.data; // Return only data
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Login failed" };
  }
};

// Signup User
export const signupUser = async (name, email, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { name, email, password, role });

    if (response.data.success && role === "hospital") {
      localStorage.setItem("hospitalEmail", email); // Store hospital email after signup
    }

    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Signup failed" };
  }
};

// Logout User
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("hospitalEmail"); // Clear stored hospital email on logout
};
