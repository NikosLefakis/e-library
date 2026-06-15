const db = require('../database/db');
const Sequelize = require('sequelize');

const Book = db.define('book', {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    isbn: {
    	type:Sequelize.TEXT,
    	allowNull: false
    },
    authors: {
    	type: Sequelize.TEXT,
    	allowNull: true
    },
    genre: {
    	type: Sequelize.TEXT,
    	allowNull: true
    },
    pages: {
    	type:Sequelize.INTEGER,
    	allowNull: false
    },
    publicationyear: {
    	type: Sequelize.INTEGER,
    	allowNull: true
    },
    url: {
    	type: Sequelize.STRING,
    	allowNull: true
    },
    photo: {
    	type: Sequelize.STRING,
    	allowNull: true
    },
    available: {
        type:Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = Book;