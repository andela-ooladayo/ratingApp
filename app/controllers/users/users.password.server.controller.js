'use strict';

var _ = require('lodash'),
    errorHandler = require('../errors'),
    passport = require('passport'),
    config = require('../../../config/config'),
    nodemailer = require('nodemailer'),
    mailer = require('../email.server.controller'),
    moment = require('moment'),
    db = require('../../../config/sequelize'),
    tokenService = require('../../services/token'),
    async = require('async'),
    crypto = require('crypto');


exports.forgot = function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buffer) {
                var token = buffer.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            if (req.body.email) {

                db.User.find({where : {
                    email: req.body.email }
                }).then(function(user) {
                    if (!user) {
                        return res.status(400).send({
                            message: 'No account with that username has been found'
                        });
                    } else if (user.provider !== 'local') {
                        return res.status(400).send({
                            message: 'It seems like you signed up using your ' + user.provider + ' account'
                        });
                    } else {
                        user.reset_password_token = token;
                        user.reset_password_expires = moment().add(2, 'hours');

                        user.save().then(function() {
                            done(null, token, user);
                        }, function(err) {
                            done(err, token, user);
                        });
                    }
                }, function(err) {
                    done(err, token, null);
                });

            } else {
                return res.status(400).send({
                    message: 'Email field must not be blank'
                });
            }
        },
        function(token, user, done) {
            res.render('templates/reset-password-email', {
                name: user.firstname,
                appName: config.app.title,
                url: 'http://' + req.headers.host + '/auth/reset/' + token
            }, function(err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
       
        function(emailHTML, user, done) {

            var msg = {};
            msg.subject = "Password Reset";
            msg.to = user.email;
            msg.html = emailHTML;
            mailer(msg);

            return res.status(200).json({message: 'An email has been sent to ' + user.email + ' with further instructions.'});
        }
    ], function(err) {
        return res.status(400).json(err);
        //if (err) return next(err);
    });
};


exports.validateResetToken = function(req, res) {
    db.User.find({ where: {reset_password_token: req.params.token} }).then(function(user) {

        if (user && user.reset_password_expires > moment()) {
            return res.redirect('/password/reset/' + req.params.token);
        }
        else {
            return res.redirect('/password/reset/invalid');
        }

        
    }, function(err) {
        logger.info(err, "err");
        return res.redirect('/password/reset/invalid');
    });
};


exports.reset = function(req, res, next) {
    var passwordDetails = req.body;

    async.waterfall([
        function(done) {
            db.User.find({ where: {reset_password_token: req.params.token} }).then(function(user) {
                if (user && user.reset_password_expires > moment()) {
                    if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                        user.password = crypto.pbkdf2Sync(passwordDetails.newPassword, user.salt, 10000, 64).toString('base64');
                        user.reset_password_token = undefined;
                        user.reset_password_expires = undefined;

                        user.save().then(function() {
                            req.login(user, function(err) {
                                if (err) {
                                    res.status(400).send(err);
                                } else {
                                    res.jsonp({user: user, token: tokenService.issueToken(user)});

                                    done(err, user);
                                }
                            });
                        }, function(err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        });
                    } else {
                        return res.status(400).send({
                            message: 'Passwords do not match'
                        });
                    }
                } else {
                    return res.status(400).send({
                        message: 'Password reset token is invalid or has expired.'
                    });
                }
            }, function(err) {
                return res.status(400).send({
                    message: 'Password reset token is invalid or has expired.'
                });
            });
        },
        function(user, done) {
            res.render('templates/reset-password-confirm-email', {
                name: user.firstname,
                appName: config.app.title
            }, function(err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function(emailHTML, user, done) {

            var msg = {};
            msg.subject = "Your password has been changed";
            msg.to = user.email;
            msg.html = emailHTML;
            mailer(msg);

            res.status(200).json({message: 'Your password has been changed'});
        }
    ], function(err) {
        return res.status(400).json(err);
    });
};


exports.changePassword = function(req, res, next) {
    var passwordDetails = req.body;
    if (req.user) {
        if (passwordDetails.newPassword) {
            db.User.find({ where : { id :req.user.id}}).then(function(user) {
                if (user) {
                    var saltedCurrentPassword = crypto.pbkdf2Sync(passwordDetails.currentPassword, user.salt, 10000, 64).toString('base64');
                    if (user.password === saltedCurrentPassword) {
                        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                            user.password = crypto.pbkdf2Sync(passwordDetails.newPassword, user.salt, 10000, 64).toString('base64');
                            user.save().then(function() {
                                req.login(user, function(err) {
                                    if (err) {
                                        res.status(400).send(err);
                                    } else {
                                        res.send({
                                            message: 'Password changed successfully'
                                        });
                                    }
                                });
                            }, function(err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            });
                        } else {
                            res.status(400).send({
                                message: 'Passwords do not match'
                            });
                        }
                    } else {
                        res.status(400).send({
                            message: 'Current password is incorrect'
                        });
                    }
                } else {
                    res.status(400).send({
                        message: 'User is not found'
                    });
                }
            }, function (err) {
                res.status(400).send({
                    message: 'Unknown Error'
                });
            });
        } else {
            res.status(400).send({
                message: 'Please provide a new password'
            });
        }
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};
