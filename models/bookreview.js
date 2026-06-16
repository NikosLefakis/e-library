const db = require('../database/db');
const Sequelize = require('sequelize');
const User = require('./user');
const Book = require('./book');

const BookReview = db.define('book_review', {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    book_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    reviewscore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    }
});

BookReview.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
BookReview.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

module.exports = BookReview;