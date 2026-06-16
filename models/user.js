const db = require('../database/db.js');
const Sequelize = require('sequelize');

const User = db.define('user', {
    firstname:    { type: Sequelize.STRING, allowNull: true },
    lastname:     { type: Sequelize.STRING, allowNull: true },
    email:        { type: Sequelize.STRING, allowNull: true },
    username:     { type: Sequelize.STRING, allowNull: false },
    password:     { type: Sequelize.STRING, allowNull: false },
    role:         { type: Sequelize.ENUM("administrator","student","librarian"), allowNull: false, defaultValue: "student" },
    age:          { type: Sequelize.INTEGER, allowNull: true },
    gender:       { type: Sequelize.ENUM("male","female","other"), allowNull: true },
    address:      { type: Sequelize.STRING, allowNull: true },
    phone:        { type: Sequelize.STRING, allowNull: true },
    university:   { type: Sequelize.STRING, allowNull: true },
    student_type: { type: Sequelize.ENUM("undergraduate","postgraduate","phd"), allowNull: true }
});

module.exports = User;
