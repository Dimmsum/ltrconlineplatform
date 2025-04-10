"use client"

import { useState } from 'react';
import './signup.css';

const Signup = () => {
  // State for form inputs and password visibility (just UI, no logic implementation yet)
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <h1 className="signup-title">Create Your Account</h1>
        <p className="signup-subtitle">Join the Language Teaching and Research Centre</p>
        
        <form className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idNumber">ID Number:</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                className="form-input"
                placeholder="Enter your ID number"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                placeholder="Enter your last name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-group password-toggle">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <span className="checkbox-text">Show password</span>
            </label>
          </div>
          
          <button type="submit" className="signup-button">
            Create Account
          </button>
        </form>
        
        <div className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;