"use client"
import { useState, ChangeEvent, FormEvent, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';

import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import './admin-signup.css'; // For admin-specific styles

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AdminSignup = (): JSX.Element => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Form validation
    if (!formData.firstName || !formData.lastName || 
        !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Store admin user data in Firestore with isAdmin flag
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        isAdmin: true, // Set the admin flag
        createdAt: serverTimestamp()
      });
      
      // Set success state
      setSuccess(true);
      
      // Clear the form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Redirect after a short delay to ensure Firestore write completes
      setTimeout(() => {
        router.push('/admin-login');
      }, 2000);
      
    } catch (error) {
      console.error("Admin signup error:", error);
      let errorMessage = 'Failed to create an admin account';
      
      // Handle specific Firebase errors
      if ((error as AuthError).code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if ((error as AuthError).code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if ((error as AuthError).code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container admin-signup-container">
      <div className="signup-form-container">
        <h1 className="signup-title">Create Admin Account</h1>
        <p className="signup-subtitle">Register as an administrator for the Language Teaching and Research Centre</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <p>Admin account created successfully!</p>
            <p>Redirecting to login page...</p>
          </div>
        )}
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
          
          <button 
            type="submit" 
            className="signup-button admin-signup-button"
            disabled={loading || success}
          >
            {loading ? 'Creating Admin Account...' : success ? 'Account Created!' : 'Create Admin Account'}
          </button>
        </form>
        
        <div className="login-link">
          Already have an admin account? <a href="/admin-login">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;