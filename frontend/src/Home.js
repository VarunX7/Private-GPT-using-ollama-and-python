import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Home.css";

const Home = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false); // State to control modal visibility
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const credit = { username: "admin", password: "123456" };

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleAdminLogin = () => {
    setShowAdminLogin(true); // Show Admin Panel
  };

  const handleUserLogin = () => {
    navigate("/User");
  };

  const closeAdminLogin = () => {
    setShowAdminLogin(false); //Close login panel
  };

  const handleFormSubmit=(e)=>{
    e.preventDefault();
    if(credit.username===username && credit.password===password){
      navigate("/Admin")
    }
    else{
      alert("Wrong Credentials");
    } 
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Document Bot</h1>
        <p className="welcome-subtitle">Login Below:</p>
      </div>
      <div className="button-section">
        <div className="button-row">
          <button
            onClick={handleAdminLogin}
            className="login-button admin-button"
          >
            Login as Admin
          </button>
          <button
            onClick={handleUserLogin}
            className="login-button user-button"
          >
            Login as User
          </button>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Admin Login</h2>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Username"
                className="input-field"
                value={username}
                onChange={handleUsername}
              />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={handlePassword}
              />
              <button type="submit" className="submit-button">
                Login
              </button>
              <button onClick={closeAdminLogin} className="close-button">
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );


 
};

export default Home;
