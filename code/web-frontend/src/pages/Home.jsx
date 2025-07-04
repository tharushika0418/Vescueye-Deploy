import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <h1>Welcome to Vescueye (Under Development)</h1>
      <p>Revolutionizing free flap surgery monitoring</p>

      {user ? (
        <>
          <h2>Hello, {user.name || user.email}!</h2>
          <Link to={`/${user.role}-dashboard`} className="btn">
            Go to Dashboard
          </Link>
        </>
      ) : (
        <>
          <p>
            Please <Link to="/signin">Sign In</Link> or{" "}
            <Link to="/signup">Sign Up</Link> to get started.
          </p>
        </>
      )}
    </div>
  );
};

export default Home;
