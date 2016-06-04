'use strict';

var _ = require('lodash');

module.exports = _.extend(
	require('./users/users.authentication'),
	require('./users/users.authorization'),
	require('./users/users.password'),
	require('./users/users.profile')
);
