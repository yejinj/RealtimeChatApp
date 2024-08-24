import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [signupForm, setSignupForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const signup = async () => {
    if (!isValidEmail(signupForm.email)) {
      console.error('Invalid email format');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      console.error('Passwords do not match');
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
      <button onClick={signup}>Signup</button>
      <p>
        Already have an account? <button className="login-link" onClick={() => navigate('/login')}>Login</button>
      </p>
    </div>
  );
}

export default Signup;