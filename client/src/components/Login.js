import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const login = async () => {
    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      })
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      navigate('/chat');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={loginForm.email}
        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={loginForm.password}
        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
      />
      <button onClick={login}>Login</button>
      <p>
        Don't have an account? <a onClick={() => navigate('/signup')}>Sign Up</a>
      </p>
    </div>
  );
}

export default Login;
