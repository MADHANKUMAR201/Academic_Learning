import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
