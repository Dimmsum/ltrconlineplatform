"use client"
import { useState, ChangeEvent, FormEvent, JSX } from 'react';
import { useRouter } from 'next/navigation'; // Changed from next/router to next/navigation
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import './login.css';

interface FormData {
  idNumber: string;
  email: string;
  password: string;
}

const Login = (): JSX.Element => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    idNumber: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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

    // Form validation
    if (!formData.idNumber || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      
      // Sign in with Firebase Authentication
      // Note: Firebase doesn't directly use idNumber for auth, but we collected it for application logic
      await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // You could verify the ID number against Firestore here if needed
      // For now, we'll just assume if login succeeds, the user is valid
      
      // Redirect to dashboard after successful login (changed from home page)
      router.push('/dashboard');
      
    } catch (error) {
      let errorMessage = 'Failed to log in';
      
      // Handle specific Firebase errors
      if ((error as AuthError).code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if ((error as AuthError).code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if ((error as AuthError).code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if ((error as AuthError).code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Login to the Language Teaching and Research Centre</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idNumber">ID Number:</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                className="form-input"
                placeholder="Enter your ID number"
                value={formData.idNumber}
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <span className="checkbox-text">Show password</span>
            </label>
            
            <div className="forgot-password">
              <a href="/forgot-password">Forgot password?</a>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="signup-link">
          No account, no problem? <a href="/signup">Sign up here</a>
        </div>
      </div>
    </div>
  );
};

export default Login;