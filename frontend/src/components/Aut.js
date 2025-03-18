import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import logo from './logo.png';
import'./Aut.css';

const Aut = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [emailSentStatus, setEmailSentStatus] = useState({}); // Track email status for each job

  // Function to fetch the candidate's email and name
  const fetchCandidateData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/candidate-data');
      setCandidateEmail(response.data.email);
      setCandidateName(response.data['full name']); // Ensure this matches the API response key
      console.log('Candidate Email:', response.data.email);  // Debugging
      console.log('Candidate Name:', response.data['full name']);  // Debugging
    } catch (err) {
      console.error("Error fetching candidate data:", err);
      setError(`Error fetching candidate data: ${err.response?.data?.error || err.message}`);
    }
  };
  

  // Function to fetch the matched jobs
  const fetchMatchedJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/match-jobs');
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(`Error fetching jobs: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData(); // Fetch candidate email and name
    fetchMatchedJobs();  // Fetch jobs when the component is mounted
  }, []);

  const createMailtoLink = (job) => {
    const subject = `Interview for ${job.title} at ${job.company}`;
    const body = `
      Dear ${candidateName || 'Candidate'},

      We would like to schedule an interview for the position of ${job.title} at ${job.company}.
      Here are the details of the job opportunity:

      Job Title: ${job.title}
      Company: ${job.company}
      Location: ${job.location}

      The interview is scheduled for next Monday at 10:00 AM. Please let us know if this time works for you.

      Best regards,
      
      KT
    `.trim();

    return `mailto:${candidateEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleScheduleInterview = async (jobId) => {
    setEmailSentStatus((prevStatus) => ({
      ...prevStatus,
      [jobId]: 'sending', // Set status to 'sending' on click
    }));

    // Get the job details (assuming you have them in your state)
    const job = jobs.find((job) => job.job_id === jobId);

    setTimeout(async () => {
      setEmailSentStatus((prevStatus) => ({
        ...prevStatus,
        [jobId]: 'sent', // After 10 seconds, change the status to 'sent'
      }));

      // Add a new row to the Adm table
      try {
        await axios.post('http://localhost:5000/api/add-job', {
          name: candidateName, // Use the actual candidate name
          email: candidateEmail,
          job: job.title,
        });
        console.log('Job added to Adm table');
      } catch (error) {
        console.error('Error adding job to Adm table:', error);
      }
    }, 10000);
  };

  if (loading) {
    return <div>Loading recommended jobs...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (<div className='aut-page'>
    <header className="cvupload-header">
                <img src={logo} alt="Logo" className="logo" />
                <Link to="/">
                    <button className="logout-button">Log out</button>
                </Link>
            </header>
    <div className="job-list">
      <h2>Recommended Jobs</h2>
      {jobs.length === 0 ? (
        <p>No job matches found</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.job_id} className="job-item">
              <h3>{job.title}</h3>
              <p>Company: &nbsp;&nbsp;&nbsp;&nbsp;{job.company}</p>
              <p>Location: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{job.location}</p>
              <p>Skill Match: &nbsp;&nbsp;&nbsp;&nbsp;{job.skill_match_percentage.toFixed(2)}%</p>
              <a
                href={createMailtoLink(job)}
                className="sch-button"
                onClick={() => handleScheduleInterview(job.job_id)}
              >
                {emailSentStatus[job.job_id] === 'sent'
                  ? 'Email Sent'
                  : emailSentStatus[job.job_id] === 'sending'
                  ? 'Sending...'
                  : 'Schedule Interview'}
              </a>
            </li>
          ))}
        </ul>
      )}
      </div>
      <div className='n-group'>
     <Link to='/candidate/dashboard'><button className='lu'>Candidate infos </button></Link>
     <Link to='/CVUpload'><button className='lu'>Resume Parsing</button></Link>
     </div>
     <footer className="footer">
                <p>&copy; 2024 July.</p>
            </footer>
     </div>
  );
};

export default Aut;
