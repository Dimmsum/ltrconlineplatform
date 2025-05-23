'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../useAuth'; // Adjust path as needed
import { auth, db } from '../../firebase/config'; // Adjust path as needed
import './dashboard.css';

interface UserData {
  idNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Meeting {
  id: string;
  Date: string;
  Time: string;
  Request: string;
  AdditionalInformation: string;
  createdAt: Date;
  userId: string;
}

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState<boolean>(true);
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  // Fetch upcoming meetings without complex queries
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user?.uid) return;
      
      setLoadingMeetings(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        // Query meetings using userId instead of userEmail to match security rules
        const meetingsRef = collection(db, 'meetings');
        const simpleQuery = query(meetingsRef, where('userId', '==', user.uid));
        
        const querySnapshot = await getDocs(simpleQuery);
        const meetings: Meeting[] = [];
        
        // Client-side filtering for upcoming meetings
        querySnapshot.forEach((doc) => {
          const meetingData = doc.data();
          // Only include meetings on or after today
          if (meetingData.Date >= todayStr) {
            meetings.push({
              id: doc.id,
              ...meetingData
            } as Meeting);
          }
        });
        
        // Client-side sorting by date and time
        meetings.sort((a, b) => {
          // First compare by date
          if (a.Date < b.Date) return -1;
          if (a.Date > b.Date) return 1;
          
          // If same date, compare by time
          return a.Time < b.Time ? -1 : 1;
        });
        
        setUpcomingMeetings(meetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoadingMeetings(false);
      }
    };
    
    if (user) {
      fetchMeetings();
    }
  }, [user, submitSuccess]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Get user's display name or fallback
  const getUserName = () => {
    if (!user) return 'User';
    
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } else if (user.displayName) {
      return user.displayName;
    } else if (user.email) {
      return user.email.split('@')[0];
    } else {
      return 'User';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      if (!user) throw new Error("User not authenticated");
      if (!userData) throw new Error("User data not loaded");
      if (!selectedDate) throw new Error("Please select a date");
      if (!selectedTime) throw new Error("Please select a time");
      
      const form = e.currentTarget;
      const formElements = form.elements as HTMLFormControlsCollection;
      const helpTopicElement = formElements.namedItem('helpTopic') as HTMLSelectElement;
      const additionalInfoElement = formElements.namedItem('additionalInfo') as HTMLTextAreaElement;
      
      // Prepare the meeting data
      const meetingData = {
        IDNumber: userData.idNumber || 'Not provided', // Use the ID number from user data
        Name: getUserName(),
        Request: helpTopicElement ? helpTopicElement.value : 'Not specified',
        AdditionalInformation: additionalInfoElement ? additionalInfoElement.value : '',
        Date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        Time: selectedTime,
        createdAt: new Date(),
        userEmail: user.email || 'No email',
        userId: user.uid // Add the user's UID to match security rules
      };
      
      // Add to Firestore
      const meetingsRef = collection(db, 'meetings');
      await addDoc(meetingsRef, meetingData);
      
      console.log("Meeting scheduled successfully:", meetingData);
      setSubmitSuccess(true);
      
      // Reset form inputs manually
      if (helpTopicElement) helpTopicElement.value = '';
      if (additionalInfoElement) additionalInfoElement.value = '';
      setSelectedDate(null);
      setSelectedTime('');
      
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar functions
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (): (number | null)[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Time slots from 8 AM to 6 PM
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  });

  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateSelect = (day: number | null) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
      setSelectedTime('');
    }
  };

  // Handle time selection - all times are now available
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Format date as Month Year
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format date for display in the meeting card
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Get weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format time for form submission (convert from "1:00 PM" to "13:00")
  const formatTimeForSubmission = (timeStr: string): string => {
    if (!timeStr) return '';
    
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let adjustedHours = hours;
    
    if (period === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (period === 'AM' && hours === 12) {
      adjustedHours = 0;
    }
    
    return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1 className="user-name">{getUserName()}</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="main-content">
        <div className="dashboard-layout">
          <div className="schedule-form">
            {submitSuccess && (
              <div className="success-message">
                Your meeting has been scheduled successfully!
                <button 
                  className="close-btn"
                  onClick={() => setSubmitSuccess(false)}
                >
                  ×
                </button>
              </div>
            )}
            
            {submitError && (
              <div className="error-message">
                {submitError}
                <button 
                  className="close-btn"
                  onClick={() => setSubmitError(null)}
                >
                  ×
                </button>
              </div>
            )}
            
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
                  required
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
                <label htmlFor="additionalInfo" className="form-label">
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  className="form-textarea"
                  placeholder="Please provide any additional details about what you need help with..."
                  rows={4}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Pick a date and time
                </label>
                
                <div className="calendar-container">
                  {/* Calendar Navigation */}
                  <div className="calendar-nav">
                    <button 
                      type="button"
                      className="calendar-nav-btn" 
                      onClick={prevMonth}
                    >
                      &lt; Prev
                    </button>
                    <h3 className="calendar-title">{formatMonthYear(currentDate)}</h3>
                    <button 
                      type="button"
                      className="calendar-nav-btn" 
                      onClick={nextMonth}
                    >
                      Next &gt;
                    </button>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="calendar-grid">
                    <div className="calendar-weekdays">
                      {weekdays.map(day => (
                        <div key={day} className="weekday-cell">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="calendar-days">
                      {generateCalendarDays().map((day, index) => (
                        <div
                          key={index}
                          className={`calendar-day ${
                            day === null 
                              ? 'empty-day' 
                              : selectedDate && day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth()
                                ? 'selected-day'
                                : ''
                          }`}
                          onClick={() => day && handleDateSelect(day)}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="time-selection">
                      <h3 className="time-selection-title">
                        Select time for {selectedDate.toLocaleDateString()}:
                      </h3>
                      <div className="time-slots">
                        {timeSlots.map(time => (
                          <div
                            key={time}
                            className={`time-slot available-time ${
                              selectedTime === time ? 'selected-time' : ''
                            }`}
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedDate && selectedTime && (
                  <div className="selection-summary">
                    Selected: {selectedDate.toLocaleDateString()} at {selectedTime}
                  </div>
                )}
                
                <input
                  type="hidden"
                  name="appointmentDate"
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                />
                <input
                  type="hidden"
                  name="appointmentTime"
                  value={formatTimeForSubmission(selectedTime)}
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={!selectedDate || !selectedTime || submitting}
              >
                {submitting ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </form>
          </div>
          
          <div className="upcoming-meetings">
            <h2 className="upcoming-title">Upcoming Meetings</h2>
            
            {loadingMeetings ? (
              <div className="meetings-loading">
                <div className="loading-spinner-small"></div>
                <p>Loading your meetings...</p>
              </div>
            ) : upcomingMeetings.length > 0 ? (
              <div className="meetings-list">
                {upcomingMeetings.map((meeting) => (
                  <div className="meeting-card" key={meeting.id}>
                    <div className="meeting-header">
                      <span className="meeting-topic">{meeting.Request}</span>
                      <span className="meeting-date">{formatDate(meeting.Date)}</span>
                    </div>
                    
                    <div className="meeting-time">
                      <span className="time-label">Time:</span>
                      <span className="time-value">{meeting.Time}</span>
                    </div>
                    
                    {meeting.AdditionalInformation && (
                      <div className="meeting-details">
                        {meeting.AdditionalInformation}
                      </div>
                    )}
                    
                    <div className="meeting-actions">
                      <a 
                        href="https://us05web.zoom.us/j/9165424397?pwd=fdV2viHqAWei31YqiDmoknU64yMEk3.1" 
                        className="zoom-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join Zoom Meeting
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-meetings">
                <p>You don&apos;t have any upcoming meetings.</p>
                <p>Schedule one using the form on the left!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;