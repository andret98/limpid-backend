const Router = require('express')();
const {authorizeAndExtractTokenAsync} = require('../Security/jwtFilter');
const UsersController = require('./UsersController.js');

Router.use('/users', authorizeAndExtractTokenAsync, UsersController);

module.exports = Router;