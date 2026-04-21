import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import '../styles/login.css';
import { authAPI } from '../services/api';

export default function Login() {
  const { login, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setDepartment('');
    setStudentId('');
    setLoginError('');
    setSignUpError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }

    setIsLoginLoading(true);
    const result = await login(email, password, selectedRole);
    setIsLoginLoading(false);
    if (!result.success) {
      if (result.message && result.message.toLowerCase().includes('blocked')) {
        setLoginError('You are blocked. Contact your admin.');
      } else {
        setLoginError(result.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoginLoading(true);
    setLoginError('');
    try {
      // We will send the access_token to our backend to verify and log the user in
      const res = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.access_token, role: selectedRole })
      });
      const data = await res.json();
      
      if (data.success) {
        // To integrate with Context, we need to pass the login event. 
        // We can simulate the login context behaviour by manually setting token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Force reload to let AuthContext pick it up
        window.location.href = `/${data.user.role}-dashboard`;
      } else {
        setLoginError(data.message || 'Google Login failed.');
      }
    } catch (err) {
      setLoginError('An error occurred during Google Sign In.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setLoginError('Login Failed'),
  });

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpSuccess('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setSignUpError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setSignUpError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setSignUpError('Password must be at least 6 characters long');
      return;
    }

    if (selectedRole === 'student' && !studentId) {
      setSignUpError('Student ID is required for students');
      return;
    }

    setIsSignUpLoading(true);

    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        role: selectedRole,
        department: department || '',
        studentId: selectedRole === 'student' ? studentId : '',
      });

      if (response.success) {
        setSignUpSuccess('Account created successfully! Please log in.');
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDepartment('');
        setStudentId('');
        // Switch to login after 2 seconds
        setTimeout(() => {
          setIsSignUp(false);
          setSignUpSuccess('');
        }, 2000);
      } else {
        setSignUpError(response.message || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      setSignUpError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSignUpLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shape shape-1"></div>
        <div className="background-shape shape-2"></div>
        <div className="background-shape shape-3"></div>
      </div>

      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <h1>EduSustain</h1>
            <p>Academic Learning Sustainability Platform</p>
          </div>

          {!isSignUp ? (
            <>
              {/* Role Selection */}
              <div className="role-selection">
                <label className="role-label">Select Your Role</label>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('student')}
                  >
                    <span className="role-name">Student</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${selectedRole === 'faculty' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('faculty')}
                  >
                    <span className="role-name">Faculty</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('admin')}
                  >
                    <span className="role-name">Admin</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="login-form">
                {loginError && <div className="error-message">{loginError}</div>}

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`Enter your ${selectedRole} email`}
                    disabled={isLoginLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isLoginLoading}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoginLoading}
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="forgot-link">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

                <div className="login-separator">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="google-button"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  Sign in with Google
                </button>
              </form>

              {/* Footer */}
              <div className="login-footer">
                <p>
                  Don't have an account? <button
                    className="link-button"
                    onClick={() => {
                      setIsSignUp(true);
                      setLoginError('');
                    }}
                  >
                    Sign up here
                  </button>
                </p>
                <p className="security-info">Your data is secure and encrypted</p>
              </div>
            </>
          ) : (
            <>
              {/* Role Selection for Sign Up */}
              <div className="role-selection">
                <label className="role-label">Select Your Role</label>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('student')}
                  >
                    <span className="role-name">Student</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${selectedRole === 'faculty' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('faculty')}
                  >
                    <span className="role-name">Faculty</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('admin')}
                  >
                    <span className="role-name">Admin</span>
                  </button>
                </div>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSignUpSubmit} className="login-form">
                {signUpError && <div className="error-message">{signUpError}</div>}
                {signUpSuccess && <div className="success-message">{signUpSuccess}</div>}

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSignUpLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`Enter your ${selectedRole} email`}
                    disabled={isSignUpLoading}
                    required
                  />
                </div>

                {selectedRole === 'student' && (
                  <div className="form-group">
                    <label htmlFor="studentId">Student ID</label>
                    <input
                      type="text"
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter your student ID"
                      disabled={isSignUpLoading}
                      required
                    />
                  </div>
                )}

                {(selectedRole === 'faculty' || selectedRole === 'student') && (
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Enter your department"
                      disabled={isSignUpLoading}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signup-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (min 6 characters)"
                      disabled={isSignUpLoading}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      disabled={isSignUpLoading}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={isSignUpLoading}
                >
                  {isSignUpLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="login-footer">
                <p>
                  Already have an account? <button
                    className="link-button"
                    onClick={() => {
                      setIsSignUp(false);
                      setSignUpError('');
                      setSignUpSuccess('');
                    }}
                  >
                    Log in here
                  </button>
                </p>
                <p className="security-info">Your data is secure and encrypted</p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
