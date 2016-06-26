'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    errorHandler = require('./errors'),
    searchEngine = require('./search.engine.server.controller'),
    checkRequestBody = require('./request.body.checker');


exports.create = function(req, res) {
    
    var data = req.body;

    delete data.no_of_rating_five;
    delete data.no_of_rating_four;
    delete data.no_of_rating_three;
    delete data.no_of_rating_two;
    delete data.no_of_rating_one;

    //data.UserId = req.user.id;

    var error = checkRequestBody(data, ['merchant_id', 'business_name', 'business_description', 'business_email', 'business_phone_number', 'business_category_id', 'business_address_country', 'business_address_state', 'business_address_city', 'business_address_street', 'business_address']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.services.create(req.body).done(function(err, service) {
            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(service);

            searchEngine.create(service.dataValues, service.id);
        });
    }
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
