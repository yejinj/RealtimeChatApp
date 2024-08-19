import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [signupForm, setSignupForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });

  const signup = async () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const response = await fetch('http://localhost:8080/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: signupForm.email,
        username: signupForm.username,
        password: signupForm.password
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Signup successful!');
      navigate('/login');
    } else {
      alert(data.message);
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
        Already have an account? <a onClick={() => navigate('/login')}>Login</a>
      </p>
    </div>
  );
}

export default Signup;
