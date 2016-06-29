'use strict';

var users = require('../../app/controllers/users'),
    core = require('../../app/controllers/core'),
    fileSigning = require('../../app/controllers/file.signing.server.controller');

module.exports = function(app) {

    app.route('*').get(core.index);

    app.route('/api/sign_s3')
        .get(users.isAuthenticated, users.isAuthorized('user'), fileSigning.sign);
};


