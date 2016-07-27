'use strict';

var users = require('../../app/controllers/users'),
    stats = require('../../app/controllers/stats.server.controller');

module.exports = function(app) {
    app.route('/api/stats')
        .get(users.isAuthenticated, stats.getStats);
        //should be .get(users.isAuthenticated, users.isAuthorized('admin'), stats.getStats);
};
