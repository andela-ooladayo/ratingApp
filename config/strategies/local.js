'use strict';

var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
    db = require('../sequelize');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
		function(email, password, done) {
			db.User.find({where :{email: email}}).done(function(err,user){
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown User'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password or email'
                    });
                }

                return done(null, user);
            });

		}
	));
};
