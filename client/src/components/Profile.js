import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Profile() {
  const { email } = useParams(); // useParams로 이메일 파라미터 가져오기
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    profilePicture: '',
    bio: '',
    contactInfo: '',
    mbti: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:8080/profile/${email}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
  
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
  
    fetchProfile();
  }, [email]);  

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
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
          contactInfo: profile.contactInfo,
          mbti: profile.mbti,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        const updatedProfile = await response.json();
        setProfile(updatedProfile.user);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="profile-container">
      <h2>{profile.username}'s Profile</h2>
      {profile.profilePicture && <img src={profile.profilePicture} alt="Profile" />}
      
      <div>
        <label>Email:</label>
        <input type="text" name="email" value={profile.email} readOnly />
      </div>

      <div>
        <label>Username:</label>
        <input type="text" name="username" value={profile.username} readOnly />
      </div>

      <div>
        <label>Profile Picture URL:</label>
        <input
          type="text"
          name="profilePicture"
          value={profile.profilePicture}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      <div>
        <label>Bio:</label>
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      <div>
        <label>Contact Info:</label>
        <input
          type="text"
          name="contactInfo"
          value={profile.contactInfo}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      <div>
        <label>MBTI:</label>
        <input
          type="text"
          name="mbti"
          value={profile.mbti}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      {isEditing ? (
        <button onClick={handleSave}>Save</button>
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit</button>
      )}
    </div>
  );
}

export default Profile;