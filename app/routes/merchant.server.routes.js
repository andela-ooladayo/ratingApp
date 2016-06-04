'use strict';

var users = require('../../app/controllers/users'),
    merchant = require('../../app/controllers/merchant');

module.exports = function(app) {
    app.route('/api/merchant/request')
        .post(users.isAuthenticated, users.isAuthorized('user'), merchant.requestToBeMerchant);
};
