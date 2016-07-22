'use strict';

var users = require('../../app/controllers/users'),
    service = require('../../app/controllers/service.server.controller');

module.exports = function(app) {

    app.route('/service')
        .get(service.list)
        .post(users.isAuthenticated, users.isAuthorized('merchant'), service.create);

    app.route('/service/search')
        .get(service.searchAll);

    app.route('/api/service/filter')
        .get(users.isAuthenticated, users.isAuthorized('user'), service.filterBy);

    app.route('/service/top-rated')
        .get(service.topRated);

    app.route('/service/top-reviews')
        .get(service.topReviews);

    app.route('/service/:serviceId')
        .get(service.read)

    app.route('/api/service/:serviceId')
        .get(service.read)
        .put(users.isAuthenticated, users.isAuthorized('merchant'), service.isOwner, service.update)
        .delete(users.isAuthenticated, users.isAuthorized('merchant'), service.isOwner, service.delete);

    app.route('/service/category/:categoryId')
        .get(service.searchByCategoryId);

    app.route('/service/merchant/:merchantId')
        .get(service.read);

    app.param('serviceId', service.serviceByID);
    app.param('merchantId', service.serviceByMerchantID);
};
