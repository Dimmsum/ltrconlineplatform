'use client';

import React, { useState, FormEvent } from 'react';
import './dashboard.css';

interface FormData {
  helpTopic: string;
  appointmentDate: string;
  appointmentTime: string;
}

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const target = e.target as typeof e.target & {
      helpTopic: { value: string };
    };
    
    const formData: FormData = {
      helpTopic: target.helpTopic.value,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime
    };
    
    console.log("Form submitted with data:", formData);
    // You can add your submission logic here
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1 className="user-name">John Doe</h1>
        <button className="logout-btn">Logout</button>
      </div>

      <div className="main-content">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="helpDropdown" className="form-label">
                What do you need help with?
              </label>
              <select 
                id="helpDropdown" 
                name="helpTopic"
                defaultValue=""
                className="form-select"
              >
                <option value="" disabled>--Please select an option--</option>
                <option value="verbs">Verbs</option>
                <option value="writing">Writing</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="pronunciation">Pronunciation</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Pick a date and time
              </label>
              
              <div className="date-time-picker">
                <div className="date-picker">
                  <label htmlFor="dateInput" className="sub-label">Date:</label>
                  <input
                    type="date"
                    id="dateInput"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input"
                    required
                  />
                </div>
                
                <div className="time-picker">
                  <label htmlFor="timeInput" className="sub-label">Time:</label>
                  <input
                    type="time"
                    id="timeInput"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="time-input"
                    required
                  />
                </div>
              </div>
              
              {selectedDate && selectedTime && (
                <div className="selection-summary">
                  Selected: {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={!selectedDate || !selectedTime}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;