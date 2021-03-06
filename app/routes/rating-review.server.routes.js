'use strict';

var users = require('../../app/controllers/users'),
    reviewRatings = require('../../app/controllers/review-ratings.server.controller');

module.exports = function(app) {
    app.route('/api/review-ratings')
        .post(users.isAuthenticated, users.isAuthorized('user'), reviewRatings.create);
};
