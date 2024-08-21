const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 데이터베이스 설정 파일에서 sequelize 인스턴스 가져오기

// User 모델 정의
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = User;
