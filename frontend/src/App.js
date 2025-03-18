import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Questions from './components/QuestionPanel';
import Feedback from './components/Feedback';
import UserSelection from './components/UserSelection';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import AddJobDescription from './components/AddJobDescription';
import JobList from './components/JobList';
import EditJobDescription from './components/EditJobDescription';
import CandidateLogin from './components/CandidateLogin';
import CandidateRegister from './components/CandidateRegister';
import CandidatePanel from './components/CandidatePanel';
import CVUpload from './components/CVUpload';
import Aut from './components/Aut';

function App() {
  return (
    <Router>
      <div>
        <Routes>
        <Route path="/" element={<UserSelection />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route path="/admin/jobs/add" element={<AddJobDescription />} />
        <Route path="/admin/jobs" element={<JobList />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/jobs/add" element={<AddJobDescription />} />
        <Route path="/admin/jobs/edit/:id" element={<EditJobDescription />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/dashboard" element={<CandidatePanel />} />
        <Route path="/CVUpload" element={<CVUpload />} />
        <Route path="/Aut" element={<Aut />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
