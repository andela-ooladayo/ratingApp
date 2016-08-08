'use strict';
var _ = require('lodash'),
    db = require('../../config/sequelize'),
    errorHandler = require('./errors'),
    checkRequestBody = require('./request.body.checker');


exports.create = function(req, res) {
    var images = req.body;
    var error = checkRequestBody(req.body, ['service_id', 'url']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.images.create(req.body).then(function(images) {
            return res.jsonp(images);
        }, function(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }
};


exports.read = function(req, res) {
    res.jsonp(req.images);
};


exports.update = function(req, res) {
    var images = req.images;
    images = _.extend(images, req.body);
    images.save().then(function() {
        res.jsonp(images);
    }, function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


exports.delete = function(req, res) {
    var images = req.images;
    images.destroy().then(function() {
        res.jsonp(images);
    }, function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


exports.listbyServiceId = function(req, res) {
    var serviceId = req.body.serviceId;
    db.images.findAll({where: { service_id: serviceId } }).then(function(images) {
        return res.status(200).json(images);
    }, function(err) {
        return res.status(400).json(err);
    });
};


exports.imageByID = function(req, res, next, id) {
    db.images.find({where: { id: id } }).then(function(images) {
        if (!images) return next(new Error('Failed to load images ' + id));
        req.images = images;
        next();
    }, function(err) {
        return next(err);
    });
};
