// JobDetails.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState({});

  useEffect(() => {
    axios.get(`/job-details/${id}`)
      .then(response => {
        setJob(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [id]);

  return (
    <div>
      <h2>{job.title}</h2>
      <p>{job.description}</p>
      <p><strong>Requirements:</strong> {job.requirements}</p>
    </div>
  );
}

export default JobDetails;
