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

  // 이메일 유효성 검사 함수
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const signup = async () => {
    // 이메일 형식이 올바른지 확인
    if (!isValidEmail(signupForm.email)) {
      console.error('Invalid email format');
      return;
    }

    // 비밀번호 확인
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

      // 성공적으로 회원가입하면 로그인 페이지로 이동
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
        Already have an account? <a onClick={() => navigate('/login')}>Login</a>
      </p>
    </div>
  );
}

export default Signup;