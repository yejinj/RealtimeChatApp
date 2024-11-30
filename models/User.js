const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false // 불필요한 SQL 로그 비활성화
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  profilePicture: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    defaultValue: '',
    validate: {
      isUrl: true
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
    validate: {
      len: [0, 500]
    }
  },
  contactInfo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  mbti: {
    type: DataTypes.STRING(4),
    allowNull: true,
    validate: {
      isIn: [['INTJ', 'INTP', 'ENTJ', 'ENTP', 
              'INFJ', 'INFP', 'ENFJ', 'ENFP',
              'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
              'ISTP', 'ISFP', 'ESTP', 'ESFP']]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
  paranoid: true,   // deletedAt 추가 (소프트 삭제)
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

// 개발 환경에서만 force: true 사용
const isDevelopment = process.env.NODE_ENV === 'development';

sequelize.sync({ force: isDevelopment })
  .then(() => {
    console.log("데이터베이스 동기화 완료!");
  })
  .catch(error => {
    console.error("데이터베이스 동기화 중 오류 발생:", error);
  });

module.exports = User;