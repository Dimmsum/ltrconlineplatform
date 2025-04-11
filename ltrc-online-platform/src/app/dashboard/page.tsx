'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../useAuth'; // Make sure this path matches where you save the hook
import { auth } from '../../firebase/config'; // Update this path to match your project structure
import './dashboard.css';

interface FormData {
  helpTopic: string;
  appointmentDate: string;
  appointmentTime: string;
}

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // In a real app, this would be fetched from an API set by admins
  const [availableTimes, setAvailableTimes] = useState<{[key: string]: string[]}>({
    // Example of pre-defined available times (would come from admin settings)
    [new Date().toDateString()]: ['9:00 AM', '10:00 AM', '2:00 PM'],
    [new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()]: ['11:00 AM', '1:00 PM', '3:00 PM']
  });
  
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
    
    if (user.displayName) {
      return user.displayName;
    } else if (user.email) {
      return user.email.split('@')[0];
    } else {
      return 'User';
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const target = e.target as typeof e.target & {
      helpTopic: { value: string };
    };
    
    const formData: FormData = {
      helpTopic: target.helpTopic.value,
      appointmentDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      appointmentTime: selectedTime
    };
    
    console.log("Form submitted with data:", formData);
    // You can add your submission logic here
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

  // Handle time selection - only allow selecting available times
  const handleTimeSelect = (time: string) => {
    if (selectedDate && isTimeAvailable(selectedDate, time)) {
      setSelectedTime(time);
    }
  };

  // Check if a time slot is available
  const isTimeAvailable = (date: Date | null, time: string): boolean => {
    if (!date) return false;
    const dateStr = date.toDateString();
    return Boolean(availableTimes[dateStr] && availableTimes[dateStr].includes(time));
  };

  // Format date as Month Year
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format time for form submission (convert from "1:00 PM" to "13:00")
  const formatTimeForSubmission = (timeStr: string): string => {
    if (!timeStr) return '';
    
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
                        } ${
                          day && isTimeAvailable(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), selectedTime)
                            ? 'available-day'
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
                      {timeSlots.map(time => {
                        const available = isTimeAvailable(selectedDate, time);
                        return (
                          <div
                            key={time}
                            className={`time-slot ${
                              selectedTime === time
                                ? 'selected-time'
                                : ''
                            } ${
                              available
                                ? 'available-time'
                                : 'unavailable-time'
                            }`}
                            onClick={() => available && handleTimeSelect(time)}
                          >
                            {time}
                          </div>
                        );
                      })}
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