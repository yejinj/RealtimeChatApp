import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Profile() {
  const { email } = useParams();
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    profilePicture: '',
    bio: '',
    contactInfo: '',
    mbti: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
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
        setError('프로필을 불러오는데 실패했습니다.');
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfile();
  }, [email]);  

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8080/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
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
        setError('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다.');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile.email) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}
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
        <button onClick={handleSave} disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </button>
      ) : (
        <button onClick={() => setIsEditing(true)} disabled={isLoading}>
          수정
        </button>
      )}
    </div>
  );
}

export default Profile;