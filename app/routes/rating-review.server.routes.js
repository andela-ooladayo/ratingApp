'use strict';

var users = require('../../app/controllers/users'),
    reviewRatings = require('../../app/controllers/review-ratings.server.controller');

module.exports = function(app) {
    app.route('/api/review-ratings')
        .post(users.isAuthenticated, users.isAuthorized('user'), reviewRatings.create);

    app.route('/api/review-ratings/:reviewId')
        .get(reviewRatings.read)
        .put(users.isAuthenticated, reviewRatings.update)
        .delete(users.isAuthenticated, reviewRatings.delete);

    app.route('/api/review-ratings/user/:userId')
        .get(reviewRatings.read)

    app.param('reviewId', reviewRatings.reviewByID);
    app.param('userId', reviewRatings.reviewByUserID);
};
