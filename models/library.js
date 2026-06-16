const db = require('../database/db');
const Sequelize = require('sequelize');

const Library = db.define('library', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true
    },
    lat: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    lon: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    librarian_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
});

module.exports = Library;
