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
        db.images.create(req.body).done(function(err, images){
            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            return res.jsonp(images);
        });
    }
};


exports.read = function(req, res) {
    res.jsonp(req.images);
};


exports.update = function(req, res) {

    var images = req.images;

    images = _.extend(images, req.body);

    images.save().done(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(images);
        }
    });
};


exports.delete = function(req, res) {
    var images = req.images;

    images.destroy().done(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(images);
        }
    });
};


exports.listbyServiceId = function(req, res) {
    var serviceId = req.body.serviceId;

    db.images.findAll({where: { service_id: serviceId } }).done(function(err, images) {
        if (err) {
            return res.status(400).json(err);
        }
        else {
            return res.status(200).json(images);
        }
    });
};


exports.imageByID = function(req, res, next, id) {
    db.images.find({where: { id: id } }).done(function(err, images) {
        if (err) return next(err);
        if (!images) return next(new Error('Failed to load images ' + id));
        req.images = images;
        next();
    });
};
