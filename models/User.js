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
});

sequelize.sync({ force: true }) // 모든 테이블 재생성 (데이터 손실에 주의)
  .then(() => {
    console.log("Database & tables created!");
  });

module.exports = User;
