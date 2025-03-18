import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminPanel.css';
import { formatDistanceToNow } from 'date-fns';
import logo from './logo.png';
import AddJobDescription from './AddJobDescription'; // Import the AddJobDescription component
import EditJobDescription from './EditJobDescription'; // Import the EditJobDescription component

function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [isAddJobPopupVisible, setIsAddJobPopupVisible] = useState(false); // Add state for add job popup visibility
  const [isEditJobPopupVisible, setIsEditJobPopupVisible] = useState(false); // Add state for edit job popup visibility
  const [selectedJobId, setSelectedJobId] = useState(null); // Track selected job ID for editing

  useEffect(() => {
    axios.get('http://localhost:5000/jobs')
      .then(response => {
        console.log('Response Data:', response.data);  // Inspect the data structure
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  const handleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const deleteJob = (id) => {
    axios.delete(`http://localhost:5000/jobs/${id}`)
      .then(response => {
        setJobs(jobs.filter(job => job.id !== id));
        alert(response.data.message);
      })
      .catch(error => {
        console.error('Error deleting job:', error);
      });
  };

  const toggleAddJobPopup = () => {
    setIsAddJobPopupVisible(!isAddJobPopupVisible);
  };

  const toggleEditJobPopup = (jobId) => {
    setSelectedJobId(jobId);
    setIsEditJobPopupVisible(!isEditJobPopupVisible);
  };

  return (
    <div className="admin-panel-page">
      <header className="admin-panel-header">
        <img src={logo} alt="Logo" className="logo" />
        <Link to="/">
          <button className="logout-button">Log out</button>
        </Link>
      </header>

      <div className="admin-panel-content">
        <div className="admin-panel-buttons">
          <button className="action-button" onClick={toggleAddJobPopup}>
            Add New Job
          </button>
          <Link to="/CVUpload">
            <button className="action-button">Resume Parsing</button>
          </Link>
        </div>

        {/* Job Cards */}
        <div className="jobs-container">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <div className="job-summary" onClick={() => handleExpand(job.id)}>
                <div className="job-header">
                  <h2 className="job-title">{job.title}</h2>
                  <p className="job-date">
                    {formatDistanceToNow(new Date(job.createdAt))} ago
                  </p>
                </div>
                <p className="job-company">
                  <b>{job.company}</b>
                </p>
              </div>
              {expandedJobId === job.id && (
                <div className="job-details">
                  <h3>Full job description: </h3>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Type:</strong> {job.jobtype}</p>
                  <p><strong>Salary Range:</strong> {job.salaryRange}</p>
                  <p><strong>Description:</strong> {job.description}</p>
                  <p><strong>Requirements:</strong> {job.requirements}</p>
                  <p><strong>Contact:</strong> {job.contact}</p>
                  <div className="job-actions">
                    <button onClick={() => toggleEditJobPopup(job.id)}>Update</button>
                    <button onClick={() => deleteJob(job.id)}>Delete</button>
                    <button onClick={() => handleExpand(null)}>Back</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup for Adding Job */}
      {isAddJobPopupVisible && (
        <div className="popup-background" onClick={toggleAddJobPopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <AddJobDescription onClose={toggleAddJobPopup} /> {/* Pass onClose prop */}
          </div>
        </div>
      )}

      {/* Modal Popup for Editing Job */}
      {isEditJobPopupVisible && selectedJobId && (
        <div className="popup-background" onClick={toggleEditJobPopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <EditJobDescription id={selectedJobId} onClose={toggleEditJobPopup} /> {/* Pass id and onClose prop */}
          </div>
        </div>
      )}

      <footer className="admin-panel-footer">
        <p>&copy; 2024 July</p>
      </footer>
    </div>
  );
}

export default AdminPanel;
