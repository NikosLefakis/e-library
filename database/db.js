const Sequelize = require('sequelize');
const requireAll = require('require-all');

const models = requireAll({
    dirname: __dirname + '/../models',
    filter: /(.+Model)\.js$/,
    excludeDirs: /^\.(git|svn)$/
});

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite'
});

sequelize.models = models;

sequelize.sync();

module.exports = sequelize;