"use client"
import "./admin.css";
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Define TypeScript interfaces for your data
interface MeetingRequest {
  id: string;
  IDNumber?: string;
  Name?: string;
  Request?: string;
  Date?: string;
  Time?: string;
  AdditionalInformation?: string;
  userEmail?: string;
  createdAt?: Timestamp | Date | string | number | null;
  [key: string]: any; // Allow for additional properties
}

const Admin = () => {
  const [activePage, setActivePage] = useState<'home' | 'history' | 'settings'>('home');
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingRequests = async () => {
      try {
        setLoading(true);
        const meetingsRef = collection(db, 'meetings');
        const q = query(meetingsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const requests: MeetingRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt || null
          } as MeetingRequest);
        });
        
        setMeetingRequests(requests);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching meeting requests: ", err);
        setError("Failed to load meeting requests. Please try again later.");
        setLoading(false);
      }
    };

    fetchMeetingRequests();
  }, []);

  const renderNavbar = () => (
    <nav className="navbar">
      <ul>
        <li 
          className={activePage === 'home' ? 'active' : ''} 
          onClick={() => setActivePage('home')}
        >
          Home
        </li>
        <li 
          className={activePage === 'history' ? 'active' : ''} 
          onClick={() => setActivePage('history')}
        >
          History
        </li>
        <li 
          className={activePage === 'settings' ? 'active' : ''} 
          onClick={() => setActivePage('settings')}
        >
          Settings
        </li>
      </ul>
    </nav>
  );

  const formatDateTime = (timestamp?: Timestamp | Date | string | number | null): string => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp objects
      let date: Date;
      
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (err) {
      console.error("Error formatting date:", err);
      return String(timestamp);
    }
  };

  const renderHome = () => (
    <div className="home-container">
      {loading ? (
        <div className="loading">Loading meeting requests...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="request-list">
          {meetingRequests.length === 0 ? (
            <div className="no-requests">No meeting requests found</div>
          ) : (
            meetingRequests.map(item => (
              <div key={item.id} className="request-container">
                <div className="request-detail">
                  <span className="label">ID Number:</span>
                  <span className="value">{item.IDNumber || 'N/A'}</span>
                </div>
                <div className="request-detail">
                  <span className="label">Name:</span>
                  <span className="value">{item.Name || 'N/A'}</span>
                </div>
                <div className="request-detail">
                  <span className="label">Reason for help:</span>
                  <span className="value">{item.Request || 'N/A'}</span>
                </div>
                <div className="request-detail">
                  <span className="label">Date and Time:</span>
                  <span className="value">{formatDateTime(item.createdAt)}</span>
                </div>
                {item.AdditionalInformation && (
                  <div className="request-detail">
                    <span className="label">Additional Information:</span>
                    <span className="value">{item.AdditionalInformation}</span>
                  </div>
                )}
                {item.userEmail && (
                  <div className="request-detail">
                    <span className="label">Email:</span>
                    <span className="value">{item.userEmail}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="history-container">
      <h2>History</h2>
      <p>History page content will go here</p>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-container">
      <h2>Settings</h2>
      <p>Settings page content will go here</p>
    </div>
  );

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return renderHome();
      case 'history':
        return renderHistory();
      case 'settings':
        return renderSettings();
      default:
        return renderHome();
    }
  };

  return (
    <>
      {renderNavbar()}
      <div className="content-container">
        {renderContent()}
      </div>
    </>
  );
};

export default Admin;