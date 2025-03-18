import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import cities from './cities.json'; // Directly import cities from JSON
import './EditJobDescription.css'; // Import the CSS file

// List of job types
const jobtypes = [
  'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
];

function EditJobDescription({ id, onClose }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobtype, setJobtype] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contact, setContact] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the existing job details
    axios.get(`http://localhost:5000/jobs/${id}`)
      .then(response => {
        const job = response.data;
        setTitle(job.title);
        setCompany(job.company);
        setLocation(job.location);
        setJobtype(job.jobtype);
        setSalaryRange(job.salaryRange || '');
        setDescription(job.description);
        setRequirements(job.requirements);
        setContact(job.contact || '');
      })
      .catch(error => {
        console.error('Error fetching job details:', error);
      });
  }, [id]);

  const updateJob = () => {
    axios.put(`http://localhost:5000/jobs/${id}`, {
      title,
      company,
      location,
      jobtype,
      salaryRange: salaryRange,
      description,
      requirements,
      contact
    })
    .then(response => {
      alert(response.data.message);
      onClose(); // Close the popup after updating
      navigate('/admin'); // Redirect to the admin panel after updating
    })
    .catch(error => {
      console.error('There was an error updating the job!', error);
    });
  };

  return (
    <div className="edit-job-description">
      <h2>Edit Job Description</h2>
      <input 
        type="text" 
        placeholder="Job Title" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Company Name" 
        value={company} 
        onChange={e => setCompany(e.target.value)} 
      />
      <select 
        value={location} 
        onChange={e => setLocation(e.target.value)}
      >
        <option value="">Select a city</option>
        {cities.map((city, index) => (
          <option key={index} value={city}>
            {city}
          </option>
        ))}
      </select>
      <select 
        value={jobtype} 
        onChange={e => setJobtype(e.target.value)}
      >
        <option value="">Select Job Type</option>
        {jobtypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <input 
        placeholder="Salary Range (Optional)" 
        value={salaryRange} 
        onChange={e => setSalaryRange(e.target.value)} 
      />
      <textarea 
        placeholder="Job Description" 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
      />
      <textarea 
        placeholder="Job Requirements" 
        value={requirements} 
        onChange={e => setRequirements(e.target.value)} 
      />
      <textarea 
        placeholder="Contact (Optional)" 
        value={contact} 
        onChange={e => setContact(e.target.value)} 
      />
      <div className="edit-job-buttons">
        <button onClick={updateJob}>Update Job</button>
        <button onClick={onClose}>Cancel</button> {/* Close the popup */}
      </div>
    </div>
  );
}

export default EditJobDescription;
