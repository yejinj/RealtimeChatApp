import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

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
      <h2>{profile.username}의 프로필</h2>
      
      <div className="profile-section">
        {profile.profilePicture && (
          <div className="profile-image-container">
            <img 
              src={profile.profilePicture} 
              alt="Profile" 
              className="profile-image"
            />
          </div>
        )}
        
        <div className="profile-fields">
          <div className="form-group">
            <label>이메일:</label>
            <input 
              type="text" 
              name="email" 
              value={profile.email} 
              readOnly 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>사용자명:</label>
            <input 
              type="text" 
              name="username" 
              value={profile.username} 
              readOnly 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>프로필 사진 URL:</label>
            <input
              type="text"
              name="profilePicture"
              value={profile.profilePicture}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-input"
              placeholder="프로필 사진 URL을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>자기소개:</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-textarea"
              placeholder="자기소개를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>연락처:</label>
            <input
              type="text"
              name="contactInfo"
              value={profile.contactInfo}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-input"
              placeholder="연락처를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>MBTI:</label>
            <select
              name="mbti"
              value={profile.mbti || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="form-select"
            >
              <option value="">MBTI 선택</option>
              {MBTI_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            {isEditing ? (
              <button 
                onClick={handleSave} 
                disabled={isLoading}
                className="save-button"
              >
                {isLoading ? '저장 중...' : '저장'}
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                disabled={isLoading}
                className="edit-button"
              >
                수정
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;