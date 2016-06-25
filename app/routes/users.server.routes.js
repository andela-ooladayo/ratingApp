'use strict';
var passport = require('passport');

module.exports = function(app) {
	var users = require('../../app/controllers/users');

	app.route('/api/users/me').get(users.me);
	app.route('/api/users').put(users.update);
	//xsapp.route('/api/users/accounts').delete(users.removeOAuthProvider);

	app.route('/api/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
    app.route('/auth/facebook').post(users.processFacebook);
	app.route('/auth/signout').get(users.signout);

	// app.route('/auth/facebook').get(passport.authenticate('facebook', {
	// 	scope: ['email']
	// }));
	// app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

	
	app.param('userId', users.userByID);
};
