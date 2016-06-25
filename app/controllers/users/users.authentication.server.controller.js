//'use strict';
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




exports.processFacebook = function(req, res) {
    var data = req.body;
    var facebook_id = data.facebook_id.toString();
    db.User.find({where :{facebook_id: facebook_id}}).done(function(err, rawUser) {
        if (err) {
            logger.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        delete req.body.role_title;
        delete req.body.role_bit_mask;
        delete req.body.password;
        delete req.body.salt;

        var user = rawUser;

        if (user) {
            
            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.save().done(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    req.login(user, function (err) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            delete user.role_title;
                            delete user.role_bit_mask;
                            delete user.password;
                            delete user.salt;

                            res.jsonp({user: user.dataValues, token: tokenService.issueToken(user.dataValues)});
                        }
                    });
                }
            });
        }

        else {
            var dbObj = {};
            dbObj.provider = 'facebook';
            dbObj.roleBitMask = roleManager.userRoles.user.bitMask;
            dbObj.roleTitle   = roleManager.userRoles.user.title;
            dbObj.displayname = req.body.firstname + ' ' + req.body.lastname;
            dbObj.firstname = data.firstname.toString();
            dbObj.lastname = data.lastname.toString();
            dbObj.email = data.email.toString();
            dbObj.facebook_id = data.facebook_id.toString();

            var user = db.User.build(dbObj);

            user
                .save()
                .done(function(err, user) {
                    if(err) {
                        logger.error(err, "err");
                        logger.error('Error :' +err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    else {
                        user.dataValues.password = undefined;
                        user.dataValues.salt = undefined;
                        user.dataValues.reset_password_expires = undefined;
                        user.dataValues.reset_password_token = undefined;

                        req.login(user.dataValues, function(err) {
                            if (err) {
                                logger.info(err, "err")
                                res.status(400).send(err);
                            } else {
                                
                                var msg = {};
                                msg.subject = "Account Creation";
                                msg.from = "no-reply@onepercentlab.com";
                                msg.to = user.email;
                                msg.html = "<p> Thank you for registering with us. </p>" + "<p> Rating App Support Team</p>"
                                mailer(msg);

                                res.jsonp({user: user.dataValues, token: tokenService.issueToken(user.dataValues)});
                            }
                        });
                    }
                });
            }
    });
};


