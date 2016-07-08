'use strict';

var users = require('../../app/controllers/users'),
    images = require('../../app/controllers/images');

module.exports = function(app) {
    app.route('/api/images')
        .post(users.isAuthenticated, users.isAuthorized('user'), images.create);

    app.route('/api/images/:imageId')
        .get(images.read)
        .put(users.isAuthenticated, users.isAuthorized('merchant'), images.update)
        .delete(users.isAuthenticated, users.isAuthorized('merchant'), images.delete);

    app.route('/api/images/fetch')
        .post(users.isAuthenticated, images.listbyServiceId);

    app.param('imageId', images.imageByID);
};
