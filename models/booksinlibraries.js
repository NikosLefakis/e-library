const db = require('../database/db');
const Sequelize = require('sequelize');
const Book = require('./book');
const Library = require('./library');

const BooksInLibraries = db.define('books_in_library', {
    book_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    library_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
});

BooksInLibraries.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
BooksInLibraries.belongsTo(Library, { foreignKey: 'library_id', as: 'library' });

module.exports = BooksInLibraries;
