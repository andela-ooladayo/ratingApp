'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    async = require('async'),
    errorHandler = require('./errors');


exports.create = function(req, res) {
    var reviewRating = req.body;

    db.review_ratings.create(reviewRating).done(function(err, reviewRating){
        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        return res.staus(200).json({message: "sucessful"});
    });
};
