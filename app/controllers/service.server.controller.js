'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    errorHandler = require('./errors');


exports.create = function(req, res) {
    var service = req.body;

    service.UserId = req.user.id;

    db.services.create(req.body).done(function(err, service) {
        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        return res.jsonp(service);
    });
};


exports.read = function(req, res) {
    res.jsonp(req.service);
};


exports.update = function(req, res) {

    var service = req.service;

    service = _.extend(service, req.body);

    service.save().done(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(service);
        }
    });
};


exports.delete = function(req, res) {
    var service = req.service;

    service.destroy().done(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(service);
        }
    });
};


exports.list = function(req, res) {
    db.services.findAll({ include: [{ model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'phone_number'] }], order: 'created' }).done(function(err, services) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(services);
        }
    });
};


exports.serviceByID = function(req, res, next, id) {
    db.services.find({where: { id: id }, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'phone_number'] } ] }).done(function(err, service) {
        if (err) return next(err);
        if (!service) return next(new Error('Failed to load service ' + id));
        req.service = service;
        next();
    });
};


exports.isOwner = function(req, res, next) {
    if (req.service.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};
