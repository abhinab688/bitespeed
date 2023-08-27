const Sequelize = require('sequelize');

const sequelize = require('../Model/database');

const Contact = sequelize.define('Contact', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    phoneNumber: Sequelize.STRING,
    email: Sequelize.STRING,
    linkedId: Sequelize.INTEGER,
    linkPrecedence: Sequelize.STRING,
    deletedAt: Sequelize.TIME
});

module.exports = Contact;