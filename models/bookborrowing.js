const db = require('../database/db');
const Sequelize = require('sequelize');
const User = require('./user');
const Book = require('./book');

const BookBorrowing = db.define('book_borrowing', {
    book_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user_id: {
        type:Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM("requested","borrowed","returned","successEnd")
    }
});
BookBorrowing.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
BookBorrowing.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

module.exports = BookBorrowing;