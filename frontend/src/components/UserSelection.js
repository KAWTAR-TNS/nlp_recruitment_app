import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserSelection.css'; 
import logo from './logo.png'; // Update this path
import rightImage from './cv.png';
import AdminLogin from './AdminLogin'; // Import AdminLogin component

function UserSelection() {
  const [showLogin, setShowLogin] = useState(false); // State to toggle login form visibility
  const [hideButton, setHideButton] = useState(false); // State to hide the button smoothly
  const navigate = useNavigate();

  const handleSelection = (role) => {
    if (role === 'admin') {
      setHideButton(true); // Hide the button
      setTimeout(() => setShowLogin(true), 500); // Delay showing login form to match button fade-out
    } else {
      navigate('/candidate'); // Navigate to candidate section if needed
    }
  };

  return (
    <div className="user-selection-page">
      <div className="user-selection-container">
        <header className="user-selection-header">
          <img src={logo} alt="Logo" className="logo" />
        </header>
        <main className="main-content">
          <div className="left-content">
            <div className="welcome-box">
              <h2>Manage job postings<br />review candidate resumes<br />match job opportunities with candidates<br />and schedule interviews</h2>
              <p>Enhance the speed of your hiring decisions.</p>
              <button
                className={`kiss ${hideButton ? 'disappear' : ''}`}
                onClick={() => handleSelection('admin')}
              >
                Go to Admin Login
              </button>
            </div>
          </div>
          {showLogin && (
            <div className="right-content">
              <AdminLogin /> {/* Render AdminLogin component */}
            </div>
          )}
          {!showLogin && (
            <div className="right-image-container">
              <img src={rightImage} alt="Right" className="right-image" />
            </div>
          )}
        </main>
        <footer className="user-selection-footer">
          <p className="footer-title">&copy; Tanassa Kawtar 2024</p>
        </footer>
      </div>
    </div>
  );
}

export default UserSelection;
