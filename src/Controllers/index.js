const Router = require('express')();
const ClientsController = require('./ClientsController.js');

Router.use('/clients', ClientsController);

module.exports = Router;