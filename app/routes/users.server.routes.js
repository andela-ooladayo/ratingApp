'use strict';
var passport = require('passport');

module.exports = function(app) {
	var users = require('../../app/controllers/users'),
        emailPoster = require('../../app/controllers/email.poster.server.controller'),
        fileSigning = require('../../app/controllers/file.signing.server.controller');

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
    app.route('/auth/linkedin').post(users.processLinkedin);
	app.route('/auth/signout').get(users.signout);

    app.route('/api/sign_s3').get(fileSigning.sign);

	// app.route('/auth/facebook').get(passport.authenticate('facebook', {
	// 	scope: ['email']
	// }));
	// app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	
	// app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	// app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

    app.route('/post_email').post(emailPoster.receiveEmailandPostIt);
	app.param('userId', users.userByID);
};
