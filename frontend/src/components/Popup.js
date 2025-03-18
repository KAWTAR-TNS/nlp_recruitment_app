import React from 'react';
import './Popup.css'; // Add styles for the popup

const Popup = ({ children, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
