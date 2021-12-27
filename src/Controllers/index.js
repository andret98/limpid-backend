const Router = require('express')();
const UsersController = require('./UsersController.js');

Router.use('/users', UsersController);

module.exports = Router;