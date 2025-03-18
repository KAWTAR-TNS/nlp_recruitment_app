import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import logo from './logo.png';
import './CVUpload.css';
import rightImage from './cv.png';

function UploadCV() {
    const [cv, setCv] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        setCv(event.target.files[0]);
        setError(null); 
        setSuccess(null); 
    };

    const handleSubmit = async () => {
        if (!cv) {
            setError('Please upload a CV file before submitting.');
            return;
        }
    
        const formData = new FormData();
        formData.append('cv', cv);
    
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/analyze-cv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setLoading(false);
            setSuccess('CV uploaded successfully!');
            console.log(response.data); 
            navigate('/candidate/dashboard');

        } catch (error) {
            setLoading(false);
            setError('Error uploading CV. Please try again.');
            console.error('Error uploading CV:', error);
        }
    };
    
    return (
        <div className='cvupload-page'>
            <header className="cvupload-header">
                <img src={logo} alt="Logo" className="logo" />
                <Link to="/">
                    <button className="logout-button">Log out</button>
                </Link>
            </header>
            <div className="cvupload-content">
                <p>Upload a CV to see what are the recommended jobs for you according to the CV.</p>
                <div className="form-group">
                    <div className="file-upload-container">
                        <input type="file" onChange={handleFileChange} />
                    </div>
                    <div className="buttons-group">
                        <button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Uploading...' : 'Process'}
                        </button>
                        <Link to="/admin/dashboard">
                            <button className="cancel-button">Cancel</button>
                        </Link>
                    </div>
                </div>
                <div className="note">it only works for PDF files !</div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </div>
            <div className="right-sidebar">
                <img src={rightImage} alt='Right Sidebar'/>
            </div>
            <footer className="footer">
                <p>&copy; 2024 July.</p>
            </footer>
        </div>
    );
}

export default UploadCV;
