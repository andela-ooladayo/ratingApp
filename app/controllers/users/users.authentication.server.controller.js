'use strict';
var _ = require('lodash'),
    errorHandler = require('../errors'),
    roleManager = require('../../../config/roleManager'),
    passport = require('passport'),
    tokenService = require('../../services/token'),
    mailer = require('../email.server.controller'),
    db = require('../../../config/sequelize');


exports.signup = function(req, res) {

    delete req.body.roleTitle;
    delete req.body.roleBitMask;

    // Init Variables
    req.body.provider = 'local';
    req.body.roleBitMask = roleManager.userRoles.user.bitMask;
    req.body.roleTitle   = roleManager.userRoles.user.title;
    req.body.displayname = req.body.firstname + ' ' + req.body.lastname;

    var user = db.User.build(req.body);

    user
        .save()
        .done(function(err,user) {
            if(err){
                logger.error('Error :' +err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                logger.info(user);

            user.password = undefined;
            user.salt = undefined;
            user.reset_password_expires = undefined;
            user.reset_password_token = undefined;

            req.login(user, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    logger.debug('New User (local) : { id: ' + user.id + ' username: ' + user.username + ' }');

                    var msg = {};
                    msg.subject = "Account Creation";
                    msg.from = "no-reply@onepercentlab.com";
                    msg.to = user.email;
                    msg.html = "<p> Thank you for registering with us. </p>" + "<p> Rating App Support Team</p>"
                    mailer(msg);

                    res.jsonp({user: user, token: tokenService.issueToken(user)});
                }
            });
            }
        });
};


exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            res.status(400).send(info);
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;
            user.reset_password_expires = undefined;
            user.reset_password_token = undefined;

            req.login(user, function(err) {
                if (err) {
                    logger.error(err);
                    res.status(400).send(err);
                } else {
                    res.jsonp({user: user, token: tokenService.issueToken(user)});
                }
            });
        }
    })(req, res, next);
};


exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};


exports.oauthCallback = function(strategy) {
    return function(req, res, next) {
        passport.authenticate(strategy, function(err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/signin');
            }
            req.login(user, function(err) {
                if (err) {
                    return res.redirect('/signin');
                }

                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    };
};


exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
    console.log("herehere")
    if (!req.user) {
        // Define a search query fields
        var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
        var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

        // Define main provider search query
        var mainProviderSearchQuery = {};
        mainProviderSearchQuery.provider = providerUserProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define additional provider search query
        var additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define a search query to find existing user with current provider profile
        var searchQuery = {
            where: bd.or(mainProviderSearchQuery, additionalProviderSearchQuery)
        };

        User.find(searchQuery).done(function(err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

                    User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
                        user = new User({
                            firstname: providerUserProfile.firstName,
                            lastname: providerUserProfile.lastName,
                            displayname: providerUserProfile.displayName,
                            email: providerUserProfile.email,
                            provider: providerUserProfile.provider,
                            providerData: providerUserProfile.providerData
                        });

                        var msg = {};
                        msg.subject = "Account Creation";
                        msg.from = "no-reply@onepercentlab.com";
                        msg.to = user.email;
                        msg.html = "<p> Thank you for registering with us. </p>" + "<p> Rating App Support Team</p>"
                        mailer(msg);
                        
                        user.save().done(function(err) {
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    } else {
        var user = req.user;

        if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
        
            if (!user.additionalProvidersData) user.additionalProvidersData = {};
            user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

            user.markModified('additionalProvidersData');

            user.save().done(function(err) {
                return done(err, user, '/settings/accounts');
            });
        } else {
            return done(new Error('User is already connected using this provider'), user);
        }
    }
};



exports.removeOAuthProvider = function(req, res, next) {
    var user = req.user;
    var provider = req.param('provider');

    if (user && provider) {
        if (user.additionalProvidersData[provider]) {
            delete user.additionalProvidersData[provider];

            user.markModified('additionalProvidersData');
        }
        user.save().done(function(err,user){
            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else{
                req.login(user, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.jsonp({user: user, token: tokenService.issueToken(user)});
                    }
                });
            }
        });
    }
};
