'use strict';

var _ = require('lodash'),
	errorHandler = require('../errors'),
	passport = require('passport'),
    tokenService = require('../../services/token'),
    db = require('../../../config/sequelize');


exports.update = function(req, res) {
	var user = db.User.build(req.user);

    if(!req.user) {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
    else{
        db.User.find({where: { id: req.user.id } }).done(function(err, user) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!user) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(new Error('Failed to load user ' + id))
                });
            }

            delete req.body.role_title;
            delete req.body.role_bit_mask;
            delete req.body.password;
            delete req.body.salt;


            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.displayname = user.firstname + ' ' + user.lastname;
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
                            res.jsonp({user: user, token: tokenService.issueToken(user)});
                        }
                    });
                }
            });
        });
    }

};


exports.me = function(req, res) {
    res.jsonp({user: user, token: tokenService.issueToken(user)} || null);
};
