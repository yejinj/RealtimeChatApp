import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [signupForm, setSignupForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const signup = async () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupForm.email,
          username: signupForm.username,
          password: signupForm.password,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Signup failed');
      }
  
      const data = await response.json();
      console.log('Signup successful:', data);
      navigate('/login');
    } catch (error) {
      console.error('Error during signup:', error);
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={signupForm.email}
        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="Username"
        value={signupForm.username}
        onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={signupForm.password}
        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={signupForm.confirmPassword}
        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={signup}>Signup</button>
      <p>
        Already have an account? 
        <button 
          onClick={() => navigate('/login')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'blue', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            padding: 0
          }}>
          Login
        </button>
      </p>
    </div>
  );
}

export default Signup;
