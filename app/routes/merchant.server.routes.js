'use strict';

var users = require('../../app/controllers/users'),
    merchant = require('../../app/controllers/merchant.server.controller');

module.exports = function(app) {
    app.route('/api/merchant/request')
        .post(users.isAuthenticated, users.isAuthorized('user'), merchant.requestToBeMerchant);


    app.route('/api/merchant/waiting_list')
        .get(users.isAuthenticated, users.isAuthorized('admin'), merchant.waitingList);


    app.route('/api/merchant/approve')
        .post(users.isAuthenticated, users.isAuthorized('admin'), merchant.approvalToBeMerchant);

};
