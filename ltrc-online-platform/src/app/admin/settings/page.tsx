"use client"
import { useState } from 'react';
import '../admin.css';

const AdminSettings = () => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ]);
  
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSaveSettings = () => {
    // Here you would typically save these settings to your database
    // For now, we'll just show a success message
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="settings-container">
      <h2>Admin Settings</h2>
      
      {savedSettings && (
        <div className="success-message" style={{ 
          backgroundColor: 'rgba(52, 211, 153, 0.2)', 
          border: '1px solid #34d399',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          Settings saved successfully!
        </div>
      )}
      
      <div className="settings-section" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>Available Appointment Times</h3>
        <p style={{ marginBottom: '1rem' }}>
          Configure which time slots are available for student appointments:
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {availableTimes.map((time, index) => (
            <div key={time} style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <input
                type="checkbox"
                id={`time-${index}`}
                checked={true}
                onChange={() => {
                  // In a real implementation, this would toggle the time slot
                  console.log(`Toggled ${time}`);
                }}
              />
              <label htmlFor={`time-${index}`}>{time}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-section" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>Email Notifications</h3>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <input
            type="checkbox"
            id="email-notifications"
            checked={true}
            onChange={() => console.log('Toggled email notifications')}
          />
          <label htmlFor="email-notifications" style={{ marginLeft: '0.5rem' }}>
            Receive email notifications for new help requests
          </label>
        </div>
      </div>
      
      <button 
        onClick={handleSaveSettings}
        style={{
          backgroundColor: '#facc15',
          color: '#1e3a8a',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Save Settings
      </button>
    </div>
  );
};

export default AdminSettings;