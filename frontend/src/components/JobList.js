// JobList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get('/job-list')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h2>Available Jobs</h2>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>
            <Link to={`/job-details/${job.id}`}>{job.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobList;
