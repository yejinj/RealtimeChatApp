import React, { useState, useEffect } from 'react';

function Profile() {
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    profilePicture: '',
    bio: '',
    contactInfo: '',
  });

  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8080/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          profilePicture: profile.profilePicture, 
          bio: profile.bio, 
          contactInfo: profile.contactInfo 
        }),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile.user);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div>
      <h2>Your Profile</h2>
      <img src={profile.profilePicture} alt="Profile" width="100" />
      <div>
        <label>Profile Picture URL:</label>
        <input 
          type="text" 
          value={profile.profilePicture} 
          onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })} 
        />
      </div>
      <div>
        <label>Bio:</label>
        <textarea 
          value={profile.bio} 
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
        />
      </div>
      <div>
        <label>Contact Info:</label>
        <input 
          type="text" 
          value={profile.contactInfo} 
          onChange={(e) => setProfile({ ...profile, contactInfo: e.target.value })} 
        />
      </div>
      <button onClick={handleUpdateProfile}>Update Profile</button>
    </div>
  );
}

export default Profile;
