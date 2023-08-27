const express = require('express');
const sequelize = require('./Model/database');

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const userRoutes = require('./Routes/user');

app.use(userRoutes)


sequelize.sync()
    .then(() => {
        app.listen(3000)
    }).catch(err => {
        console.log(err)
    })