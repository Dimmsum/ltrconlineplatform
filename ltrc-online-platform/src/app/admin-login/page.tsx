"use client"
import { useState, ChangeEvent, FormEvent, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './admin-login.css';

interface FormData {
  email: string;
  password: string;
}

const AdminLogin = (): JSX.Element => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
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
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Check if user is an admin
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData && userData.isAdmin) {
        // User is an admin, redirect to admin dashboard
        router.push('/admin');
      } else {
        // User is not an admin
        setError('Access denied. This login is for administrators only.');
        await auth.signOut(); // Sign out the non-admin user
      }
      
    } catch (error) {
      console.error("Admin login error:", error);
      let errorMessage = 'Failed to log in';
      
      // Handle specific Firebase errors
      const errorCode = (error as AuthError).code;
      
      switch(errorCode) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later or reset your password';
          break;
        default:
          if ((error as Error).message) {
            errorMessage = `Error: ${(error as Error).message}`;
          }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1 className="login-title">Administrator Login</h1>
        <p className="login-subtitle">Access the Language Teaching and Research Centre Admin Panel</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
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
            className="login-button admin-login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>
        
        <div className="login-links">
          <div className="signup-link">
            Need an administrator account? <a href="/admin-signup">Register as administrator</a>
          </div>
          <div className="user-login-link">
            Regular user? <a href="/login">Go to user login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;