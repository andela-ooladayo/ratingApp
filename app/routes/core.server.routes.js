'use strict';

var users = require('../../app/controllers/users'),
    core = require('../../app/controllers/core');

module.exports = function(app) {

    app.route('*').get(core.index);

};


