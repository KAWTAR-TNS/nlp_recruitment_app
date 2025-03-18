import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.png';
import './CandidatePanel.css' ;

const CandidatePanel = () => {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/serve-data'); // Update URL to match Flask endpoint
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCandidateData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!candidateData) {
    return <div>No data available.</div>;
  }

  return (
    <div className='candidate-panel-page'>
      <header className="candidate-panel-header">
        <img src={logo} alt="Logo" className="logo" />
        <Link to="/">
          <button className="logout-button">Log out</button>
        </Link>
      </header>
      <div className="candidate-panel-content">
  <h2 className="title">Candidate Data</h2>
  <div className="candidate-details">
    <div className="detail-item"><strong>Full Name:</strong> {candidateData['full name']}</div>
    <div className="detail-item"><strong>Location:</strong> {candidateData.location?.city}</div>
    <div className="detail-item"><strong>Phone:</strong> {candidateData.phone?.join(', ')}</div>
    <div className="detail-item"><strong>Email:</strong> {candidateData.email}</div>
    <div className="detail-item"><strong>Links:</strong> {candidateData.links?.join(' ; ')}</div>
    <div className="detail-item">
      <strong>Schools:</strong>
      {candidateData.schools?.map((school, index) => (
        <React.Fragment key={index}>
          {school}
          <br />
        </React.Fragment>
      ))}
    </div>
    <div className="detail-item"><strong>Languages:</strong> {candidateData.languages?.join(', ')}</div>
    <div className="detail-item"><strong>Skills:</strong> {candidateData.skills?.join(', ')}</div>
  </div></div>
  <div className="button-group">
    <Link to='/Aut'>
      <button className="action-button">Recommended Jobs For Candidate</button>
    </Link>
    <Link to="/CVUpload">
      <button className="action-button">Cancel</button>
    </Link>
  </div>
  <footer className="footer">
                <p>&copy; 2024 July.</p>
            </footer>
</div>
    
  );
};

export default CandidatePanel;
