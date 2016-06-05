'use strict';

var users = require('../../app/controllers/users'),
    service = require('../../app/controllers/service.server.controller');

module.exports = function(app) {

    app.route('/api/service')
        .get(users.isAuthorized('user'), service.list)
        .post(users.isAuthenticated, users.isAuthorized('merchant'), service.create);

    app.route('/api/service/:serviceId')
        .get(service.read)
        .put(users.isAuthenticated, users.isAuthorized('merchant'), service.isOwner, service.update)
        .delete(users.isAuthenticated, users.isAuthorized('merchant'), service.isOwner, service.delete);

    app.param('serviceId', service.serviceByID);
};
