/*candidatelogin.js*/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidateLogin.css'; 

function CandidateLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/candidate/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/CVUpload');
      } else {
        const data = await response.json();
        console.log('Error Data:', data);  // Log error data
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);  // Log unexpected errors
      setError('An error occurred. Please try again.');
    }
  };
  

  return (
    <div className="candidate-login-page">
      <div className="login-card">
        <h2>Candidate Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default CandidateLogin;
