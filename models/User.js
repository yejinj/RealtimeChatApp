// models/User.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactInfo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mbti: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// 아래 코드가 테이블을 동기화합니다.
// force: true를 사용하면 기존 테이블이 삭제되고 새로 생성됩니다. (개발용)
sequelize.sync({ force: true })
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch(error => {
    console.error("Error synchronizing the database:", error);
  });

module.exports = User;
