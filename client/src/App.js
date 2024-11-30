import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/SignupComponent';
import Login from './components/Login';
import Chat from './components/Chat';
import Profile from './components/Profile';
import UsersList from './components/UserList';
import './App.css';

const ROUTES = [
  { path: '/signup', Component: Signup },
  { path: '/login', Component: Login },
  { path: '/chat', Component: Chat },
  { path: '/profile', Component: Profile },
  { path: '/users', Component: UsersList },
  { path: '/', Component: Login },
];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  return (
    <Router>
      <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <header className="app-header">
          <button 
            className="dark-mode-toggle" 
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>
        <Routes>
          {ROUTES.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;