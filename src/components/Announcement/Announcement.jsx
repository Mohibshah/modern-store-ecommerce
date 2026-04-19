import React, { useState, useEffect } from 'react';
import './Announcement.css';

const Announcement = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Requirement: Dismissable with localStorage
  useEffect(() => {
    const bannerStatus = localStorage.getItem('hideAnnouncement');
    if (bannerStatus === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hideAnnouncement', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <span className="scrolling-text">
          🔥 PROMO CODE: REACT20 for 20% OFF — FREE SHIPPING ON ORDERS OVER $100 — NEW SPRING COLLECTION OUT NOW!
        </span>
      </div>
      <button className="close-btn" onClick={handleClose}>✕</button>
    </div>
  );
};

export default Announcement;