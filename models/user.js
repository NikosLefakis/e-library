const db = require('../database/db.js');
const Sequelize = require('sequelize');

const User = db.define('user', {
	firstname: {
		type: Sequelize.STRING,
		allowNull: true
	},
	lastname: {
		type:Sequelize.STRING,
		allowNull: true
	},
	email: {
		type: Sequelize.STRING,
		allowNull: true
	},
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
    	type:Sequelize.ENUM("administrator","student","librarian"),
    	allowNull: false,
    	defaultValue: "student"
    }
});

module.exports = User;