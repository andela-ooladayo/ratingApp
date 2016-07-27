//'use strict';
var _ = require('lodash'),
    errorHandler = require('../errors'),
    roleManager = require('../../../config/roleManager'),
    passport = require('passport'),
    crypto = require('crypto'),
    bcrypt = require('bcryptjs'),
    tokenService = require('../../services/token'),
    mailer = require('../email.server.controller'),
    db = require('../../../config/sequelize');


exports.signup = function(req, res) {

    var data = req.body;

    delete data.roleTitle;
    delete data.roleBitMask;

    // Init Variables
    data.provider = 'local';
    data.roleBitMask = roleManager.userRoles.user.bitMask;
    data.roleTitle   = roleManager.userRoles.user.title;
    data.displayname = data.firstname + ' ' + data.lastname;

    var salt = bcrypt.genSaltSync(10);
    var hashPassword = crypto.pbkdf2Sync(data.password, salt, 10000, 64).toString('base64');
    data.salt = salt;
    data.password = hashPassword;

    var user = db.User.build(data);
    user
        .save()
        .then(function(user) {
            user.dataValues.password = undefined;
            user.dataValues.salt = undefined;
            user.dataValues.reset_password_expires = undefined;
            user.dataValues.reset_password_token = undefined;

            req.login(user.dataValues, function(err) {
                if (err) {
                    res.status(400).json(err);
                } else {
                    logger.debug('New User (local) : { id: ' + user.id + ' username: ' + user.firstname + ' }');

                    var msg = {};
                    msg.subject = "Account Creation";
                    msg.from = "no-reply@onepercentlab.com";
                    msg.to = user.email;
                    msg.html = "<p> Thank you for registering with us. </p>" + "<p> Rating App Support Team</p>"
                    mailer(msg);

                    res.jsonp({user: user, token: tokenService.issueToken(user)});
                }
            });
        }, function(err) {
            logger.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
};


exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            res.status(400).send(info);
        } else {
            // Remove sensitive data before login
            user.dataValues.password = undefined;
            user.dataValues.salt = undefined;
            user.dataValues.reset_password_expires = undefined;
            user.dataValues.reset_password_token = undefined;

            req.login(user.dataValues, function(err) {
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
    db.User.find({where :{facebook_id: facebook_id}}).then(function(rawUser) {
        logger.error(rawUser);
        delete req.body.role_title;
        delete req.body.role_bit_mask;
        delete req.body.password;
        delete req.body.salt;

        var user = rawUser;

        if (user) {
            
            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.save().then(function () {
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
            }, function(err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
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
            dbObj.image_url = data.image_url.toString();

            var user = db.User.build(dbObj);

            user
                .save().done(function(user) {
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
                }, function (err) {
                    logger.error('Error :' +err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                });
            }
    }, function(err) {
        logger.error(err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


exports.processLinkedin = function(req, res) {
    var data = req.body;
    var linkedin_id = data.linkedin_id.toString();
    db.User.find({where :{linkedin_id: linkedin_id}}).then(function(rawUser) {
        delete req.body.role_title;
        delete req.body.role_bit_mask;
        delete req.body.password;
        delete req.body.salt;

        var user = rawUser;

        if (user) {
            
            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.save().then(function () {
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
            }, function(err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        }

        else {
            var dbObj = {};
            dbObj.provider = 'linkedin';
            dbObj.roleBitMask = roleManager.userRoles.user.bitMask;
            dbObj.roleTitle   = roleManager.userRoles.user.title;
            dbObj.displayname = req.body.firstname + ' ' + req.body.lastname;
            dbObj.firstname = data.firstname.toString();
            dbObj.lastname = data.lastname.toString();
            dbObj.linkedin_id = data.linkedin_id.toString();
            dbObj.image_url = data.image_url.toString();

            var user = db.User.build(dbObj);

            user.save().then(function(user) {
                    
                user.dataValues.password = undefined;
                user.dataValues.salt = undefined;
                user.dataValues.reset_password_expires = undefined;
                user.dataValues.reset_password_token = undefined;

                req.login(user.dataValues, function(err) {
                    if (err) {
                        logger.info(err, "err")
                        res.status(400).json(err);
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
                
            }, function(err) {
                logger.error('Error :' + err);
                return res.status(400).json({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        }
    }, function (err) {
        logger.error(err);
        return res.status(400).json({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


