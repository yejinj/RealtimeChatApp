import React, { useState, useEffect } from 'react';

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="users-list-container">
      <h2>Registered Users</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            <img src={user.profilePicture} alt={`${user.username}'s profile`} width="50" />
            <div>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Bio:</strong> {user.bio}</p>
              <p><strong>Contact Info:</strong> {user.contactInfo}</p>
              <p><strong>MBTI:</strong> {user.mbti}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;
