'use strict';

var init = require('./config/init')(),
    config = require('./config/config'),
    Sequelize = require('sequelize'),
    winston = require('winston');


logger.info('SEAN application starting...');

require('./config/sequelize');


var app = require('./config/express')();

require('./config/passport')();

app.listen(config.port);

module.exports = app;

logger.info('SEAN application started on port ' + config.port);
