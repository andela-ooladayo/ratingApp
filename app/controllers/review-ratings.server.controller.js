'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    async = require('async'),
    pg = require('pg'),
    connectionString = process.env.DATABASE_URL || "postgres://project:nifemi00@localhost/rating-app",
    checkRequestBody = require('./request.body.checker'),
    errorHandler = require('./errors');


exports.create = function(req, res) {
    delete req.body.no_of_likes;
    delete req.body.no_of_dislikes;

    var reviewRating = req.body;
    var queryPar;

    reviewRating.UserId = req.user.id;
    reviewRating.no_of_likes = 0;
    reviewRating.no_of_dislikes = 0;

    var error = checkRequestBody(req.body, ['service_id', 'value', 'review']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.review_ratings.create(reviewRating).then(function(review) {
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
                
                var sql = 'UPDATE "services" SET ' + queryPar + ' = ' + queryPar + ' + 1 WHERE id=$1;';
                client.query(sql, [reviewRating.service_id], function (err, result) {
                    drop();
                    if(err) {
                        logger.info(err, " updating service error");
                    }
                    return res.status(200).json({message: "successful"});
                });
            });
        }, function(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }
};


exports.read = function(req, res) {
    var review = req.review;
    return res.status(200).json(review);
}


exports.update = function(req, res) {
    var review = req.review;
    review = _.extend(review, req.body);

    review.save().then(function() {
        res.jsonp(review);
    }, function(err) {
        return res.status(400).json({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


exports.delete = function(req, res) {
    var review = req.review;
    db.like_dislikes.find({where: { review_id: review.id } }).then(function(like_dislike) {
        if(like_dislike) {
           like_dislike.destroy().then(function() {
                review.destroy().then(function() {
                    res.jsonp(review);
                }, function(err) {
                    return res.status(400).json({
                        message: errorHandler.getErrorMessage(err)
                    });
                }); 
           });
        }
        else {
            review.destroy().then(function() {
                res.jsonp(review);
            }, function(err) {
                return res.status(400).json({
                    message: errorHandler.getErrorMessage(err)
                });
            }); 
        }
    }, function(err) {
        return next(err);
    });
};


exports.likeReview = function(req, res) {
    var likeReviewBody = req.body;
    likeReviewBody.user_id = req.user.id;

    var error = checkRequestBody(req.body, ['review_id', 'l_type']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.like_dislikes.find({where: { review_id: likeReviewBody.review_id, user_id: likeReviewBody.user_id, l_type: 'like' }}).then(function(like) {            
            if(like) {
                return res.status(200).json({message: "You've liked this review before"});
            }
            else {
                delete likeReviewBody.id;
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
                            return res.status(200).json({message: "Successful"});
                        }
                    })
                });
            }
        }, function(err) {
            console.log(err);
            return res.status(400).json({message: "Unknown error"});
        });
    }
};


exports.disLikeReview = function(req, res) {
    var disLikeReviewBody = req.body;
    disLikeReviewBody.user_id = req.user.id;

    var error = checkRequestBody(req.body, ['review_id', 'l_type']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.like_dislikes.find({where: { review_id: disLikeReviewBody.review_id, user_id: disLikeReviewBody.user_id, l_type: 'dislike' }}).then(function(dislike) {

            if(dislike) {
                return res.status(200).json({message: "You've disliked this review before"});
            }
            else {
                delete disLikeReviewBody.id;
                addLikeToRecord(disLikeReviewBody, "dislike");
                pg.connect(connectionString, function(err, client, drop) { 
                    var sql = "UPDATE review_ratings SET no_of_dislikes = no_of_dislikes + 1 WHERE id=($1);";
                    client.query(sql, [disLikeReviewBody.review_id], function () {
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
        }, function(err) {
            logger.info(err);
            return res.status(400).json({message: "Unknown error"});
        });
    }
};


function addLikeToRecord(data, type) {
    data.l_type = type;
    
    db.like_dislikes.create(data).then(function(l) {
        logger.info("addLikeToRecord");
    }, function(err) {
        logger.error("adding to like-dislike table failed", err);
    });
}

exports.reviewByUserID = function(req, res, next, id) {
    db.review_ratings.findAll({where: { UserId: id }, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'image_url'] } ] }).then(function(review) {
        if (!review) return next(new Error('Failed to load review ' + id));
        req.review = review;
        next();
    }, function(err) {
        return next(err);
    });
};


exports.reviewByID = function(req, res, next, id) {
    db.review_ratings.find({where: { id: id }, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'image_url'] } ] }).then(function(review) {
        if (!review) return next(new Error('Failed to load review ' + id));
        req.review = review;
        next();
    }, function(err) {
        return next(err);
    });
};

