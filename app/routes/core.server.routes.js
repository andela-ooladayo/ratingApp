'use strict';

var users = require('../../app/controllers/users'),
    fileSigning = require('../../app/controllers/file.signing.server.controller');

module.exports = function(app) {
    app.route('/api/sign_s3')
        .post(users.isAuthenticated, users.isAuthorized('user'), fileSigning.sign);
};


