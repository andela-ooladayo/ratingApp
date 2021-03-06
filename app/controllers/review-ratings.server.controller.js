'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    async = require('async'),
    pg = require('pg'),
    connectionString = process.env.DATABASE_URL || "postgres://dayo:nifemi00@localhost/rating-app",
    checkRequestBody = require('./request.body.checker'),
    errorHandler = require('./errors');


exports.create = function(req, res) {
    var reviewRating = req.body;
    var queryPar;

    reviewRating.user_id = req.user.id;

    var error = checkRequestBody(req.body, ['service_id', 'value', 'review']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.review_ratings.create(reviewRating).done(function(err, reviewRating) {
            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } 
            else {
                pg.connect(connectionString, function(err, client, drop) {
                    if(parseInt(reviewRating.value) == 1) {
                        queryPar = "no_of_rating_one";
                    }
                    else if(parseInt(reviewRating.value) == 2) {
                        queryPar = "no_of_rating_two";
                    }
                    else if(parseInt(reviewRating.value) == 3) {
                        queryPar = "no_of_rating_three";
                    }
                    else if(parseInt(reviewRating.value) == 4) {
                        queryPar = "no_of_rating_four";
                    }
                    else if(parseInt(reviewRating.value) == 5) {
                        queryPar = "no_of_rating_five";
                    }
                    var sql = "UPDATE services SET " + queryPar + " = " + queryPar + "+ 1 WHERE id=($1)";

                    client.query(sql, [reviewRating.service_id], function (err, result) {
                        drop();
                        return res.staus(200).json({message: "sucessful"});
                    });
                });
            }
        });
    }
};


exports.likeReview = function(req, res) {
    var likeReviewBody = req.body;
    likeReviewBody.user_id = req.user.id;

    var error = checkRequestBody(req.body, ['review_id', 'l_type']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.like_dislikes.find({where: { review_id: likeReviewBody.review_id, user_id: likeReviewBody.user_id, type_l: 'like' }}).done(function(err, like) {
            if (err) {
                console.log(err);
                return res.status(400).json({message: "Unknown error"});
            }
            
            if(like) {
                return res.status(200).json({message: "You've like this review before"});
            }
            else {
                addLikeToRecord(likeReviewBody, "like");
                pg.connect(connectionString, function(err, client, drop) { 
                    var sql = "UPDATE review_ratings SET no_of_likes = no_of_likes + 1 WHERE id=($1);";
                    client.query(sql, [likeReviewBody.review_id], function () {
                        drop();
                        if(err) {
                            logger.error(err);
                            return res.status(400).json({message: "Unknown error"});
                        }
                        else {
                            return res.status(200).json({message: "successful"});
                        }
                    })
                });
            }
        });
    }
};


exports.disLikeReview = function(req, res) {
    var disLikeReviewBody = req.body;

    var error = checkRequestBody(req.body, ['review_id', 'l_type']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.like_dislikes.find({where: { review_id: disLikeReviewBody.review_id, user_id: disLikeReviewBody.user_id, type_l: 'dislike' }}).done(function(err, dislike) {
            if (err) {
                console.log(err);
                return res.status(400).json({message: "Unknown error"});
            }
            
            if(dislike) {
                return res.status(200).json({message: "You've dislike this review before"});
            }
            else {
                addLikeToRecord(disLikeReviewBody, "dislike");
                pg.connect(connectionString, function(err, client, drop) { 
                    var sql = "UPDATE review_ratings SET no_of_dislikes = no_of_dislikes + 1 WHERE id=($1);";
                    client.query(sql, [likeReviewBody.review_id], function () {
                        drop();
                        if(err) {
                            logger.error(err);
                            return res.status(400).json({message: "Unknown error"});
                        }
                        else {
                            return res.status(200).json({message: "successful"});
                        }
                    });
                });
            }
        });
    }
};


function addLikeToRecord(data, type) {
    data.type_l = type;
    db.like_dislikes.create(data).done(function(err, l) {
        if(err) {
            logger.error("adding to like-dislike table failed", err);
        }
    });
}
