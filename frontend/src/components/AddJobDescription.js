import React, { useState } from 'react';
import axios from 'axios';
import './AddJobDescription.css';
import cities from './cities.json';

const jobtypes = [
  'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
];

function AddJobDescription({ onClose }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobtype, setJobType] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  const addJob = () => {
    if (!title || !company || !location || !jobtype || !description || !requirements) {
      setError('Please fill in all required fields.');
      return;
    }

    axios.post('http://localhost:5000/add-job', {
      title,
      company,
      location,
      jobtype,
      salaryRange,
      description,
      requirements,
      contact
    })
    .then(response => {
      alert(response.data.message);
      setTitle('');
      setCompany('');
      setLocation('');
      setJobType('');
      setSalaryRange('');
      setDescription('');
      setRequirements('');
      setContact('');
      onClose(); // Close the popup after successful job addition
    })
    .catch(error => {
      console.error('There was an error adding the job!', error);
    });
  };

  return (
    <div className="add-job-description">
      <h2>Add Job Description</h2>
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
        onChange={(e) => setLocation(e.target.value)} 
        required
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
        onChange={e => setJobType(e.target.value)}
      >
        <option value="">Select Job Type</option>
        {jobtypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <input 
        type="text" 
        placeholder="Salary Range (Optional)" 
        value={salaryRange} 
        onChange={e => setSalaryRange(e.target.value)} 
      />
      <textarea 
        placeholder="Job Description" 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
        rows="5"
      />
      <textarea 
        placeholder="Job Requirements" 
        value={requirements} 
        onChange={e => setRequirements(e.target.value)} 
        rows="5"
      />
      <textarea 
        placeholder="Contact (Optional)" 
        value={contact} 
        onChange={e => setContact(e.target.value)} 
        rows="3"
      />
      <div>
        <button onClick={addJob}>Add Job</button>
        <button className="cancel-button" onClick={onClose}>Cancel</button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AddJobDescription;
