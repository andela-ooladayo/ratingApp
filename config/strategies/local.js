'use strict';

var passport = require('passport'),
    crypto = require('crypto'),
	LocalStrategy = require('passport-local').Strategy,
    db = require('../sequelize');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
		function(email, password, done) {
            db.User.find({where :{email: email}}).then(function(user) {
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                } 
                else {
                    var hashedPassword = crypto.pbkdf2Sync(password, user.salt, 10000, 64).toString('base64');
                    if (hashedPassword !== user.password) {
                        return done(null, false, {
                            message: 'Invalid password or email'
                        });
                    }
                    else {
                       return done(null, user); 
                    }
                }
            }, function (err) { 
                return done(err);
            });
		}
	));
};
