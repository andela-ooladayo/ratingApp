'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    errorHandler = require('./errors'),
    pg = require('pg'),
    connectionString = process.env.DATABASE_URL || "postgres://raytee:nifemi00@localhost/rating-app",
    searchEngine = require('./search.engine.server.controller'),
    checkRequestBody = require('./request.body.checker');


exports.create = function(req, res) {
    
    var data = req.body;

    delete data.no_of_rating_five;
    delete data.no_of_rating_four;
    delete data.no_of_rating_three;
    delete data.no_of_rating_two;
    delete data.no_of_rating_one;

    data.UserId = req.user.id;

    var error = checkRequestBody(data, ['merchant_id', 'business_name', 'business_description', 'business_email', 'business_phone_number', 'business_category_id', 'business_address_country', 'business_address_state', 'business_address_city', 'business_address_street', 'business_address']);
    if(error) {
        return res.status(400).json(error);
    }
    else {
        db.services.create(data).then(function(service) {
            res.jsonp(service);
            searchEngine.create(service.dataValues, service.id);
        }, function(err) {
            return res.status(400).json({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }
};


exports.read = function(req, res) {
    var service = req.service;
    db.images.findAll({where: {service_id : service.id} }).then(function (images) {
        service.dataValues.images = images;

        db.review_ratings.findAll({where: {service_id : service.id}, limit: 50, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'image_url'] } ] }).then(function (reviews) { 
            service.dataValues.reviews = reviews;

            return res.status(200).json(service);
        });
    }, function(err) {
        logger.error(err, " error while retrieving images");
    });
};


exports.update = function(req, res) {
    var service = req.service;
    service = _.extend(service, req.body);

    service.save().then(function() {
        res.jsonp(service);
        searchEngine.update(service, service.id);
    }, function(err) {
        return res.status(400).json({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


exports.delete = function(req, res) {
    var service = req.service;
    db.images.find({where: { service_id: service.id } }).then(function(images) {
        if(images) {
           images.destroy().then(function() {
               service.destroy().then(function() {
                    res.jsonp(service);
                    searchEngine.delete(service.id);
                }, function(err) {
                    return res.status(400).json({
                        message: errorHandler.getErrorMessage(err)
                    });
                }); 
           });
        }
        else {
           service.destroy().then(function() {
                res.jsonp(service);
                searchEngine.delete(service.id);
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


exports.searchAll = function(req, res) {
    var query = req.query.q;
    if(!query) {
        return res.status(400).json({message: "q parameter is missing in the query"});
    }
    else {
        searchEngine.search(query, function(err, result) {
            if(err) {
                return res.status(400).json({message: "Unknown Error"});
            }
            else {
                return res.status(200).json(result.hits.hits);
            }
        });
    }
};


exports.searchByCategoryId = function(req, res) {
    var categoryId = req.params.categoryId;
    var number = req.query.nums || 10;
    if(!categoryId) {
        return res.status(400).json({message: "categoryId parameter is missing in the request"});
    }
    else {
        db.services.findAll({where: { business_category_id: categoryId }, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'phone_number'] } ], limit : number }).then(function(services) {
            var serviceList = [];
            var serviceLen = services.length;
            logger.info(serviceLen, "length")
            if(services && serviceLen > 0) {
                _.forEach(services, function(service, key) {
                    db.images.findAll({where: {service_id : service.id} }).then(function (images) {
                        service.dataValues.images = images;

                        db.review_ratings.findAll({where: {service_id : service.id}, limit: 20, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'image_url'] } ] }).then(function (reviews) { 
                            service.dataValues.reviews = reviews;
                            serviceList.push(service);
                            
                            if((key + 1) == serviceLen) {
                                return res.status(200).json(serviceList);
                            }
                        });
                    }, function(err) {
                        logger.error(err, " error while retrieving images");
                    });
                });
            }
            else {
                return res.status(200).json([]);
            }
        }, function(err) {
            logger.error(err, " error while searching service by category");
            return res.status(400).json({message : "Unknown Error"})
        });
    }
};


exports.filterBy = function(req, res) {
    var query = req.query.q;
    var by = req.query.filter_by;

    if(!query) {
        return res.status(400).json({message: "q parameter is missing in the query"});
    }
    else if(!by) {
        return res.status(400).json({message: "filter_by parameter is missing in the query"});
    }
    else {
        var queryString = by + ":" + query;
        searchEngine.filter(queryString, function(err, result) {
            if(err) {
                return res.status(400).json({message: "Unknown Error"});
            }
            else {
                return res.status(200).json(result.hits.hits);
            }
        });
    }
};


exports.list = function(req, res) {
    db.services.findAll({ include: [{ model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'phone_number'] }], order: 'created' }).then(function(services) {
        res.jsonp(services);
    }, function(err) {
        return res.status(400).json({
            message: errorHandler.getErrorMessage(err)
        });
    });
};



exports.topRated = function(req, res) {
    var number = req.query.num || 5;
    pg.connect(connectionString, function(err, client, drop) {
        if(err) {
            logger.error(err);
            return res.status(500).json({message: "server error"});
        }
        else {
            var sql = "SELECT * FROM (SELECT id, business_name, business_description, business_address_city, business_address, business_address_country FROM services ORDER BY ((no_of_rating_five * 5) + (no_of_rating_four * 4) + (no_of_rating_three * 3) + (no_of_rating_two * 2) + (no_of_rating_one * 1)) DESC) AS services LIMIT ($1)";
            client.query(sql, [number], function(err, result) {
                if(err) {
                    drop();
                    logger.error(err, "Error");
                    return res.status(500).json({message: "server error"});
                }

                var finalList = [];

                if(result && result.rows) {
                    _.forEach(result.rows, function(value, key) {
                        var nSql = "SELECT * FROM review_ratings ORDER BY value WHERE service_id=($1) LIMIT 2";
                        client.query(nSql, [value.id], function(err, rst) {
                            if(!err && rst && rst.rows) {
                                value.reviews = rst.rows;
                                finalList.push(value);
                            }
                            else {
                                value.reviews = [];
                                finalList.push(value);
                            }

                            if(result.rows.length == key + 1) {
                                drop();
                                return res.status(200).json({data: finalList});
                            } 
                        });
                    });
                }
            });
        }
    });
};


exports.topReviews = function(req, res) {
    var number = req.query.num || 5;
    pg.connect(connectionString, function(err, client, drop) {
        if(err) {
            logger.error(err);
            return res.status(500).json({message: "server error"});
        }
        else {
            var sql = 'SELECT * FROM (SELECT review_ratings.id, review_ratings.created, review_ratings.value, review_ratings.review, review_ratings.no_of_likes, review_ratings.no_of_dislikes, review_ratings."UserId", review_ratings.service_id, services.business_name, "Users".firstname, "Users".lastname FROM review_ratings LEFT JOIN "Users" ON "Users".id=review_ratings."UserId" LEFT JOIN services ON services.id=review_ratings.service_id ORDER BY no_of_likes DESC) AS review_ratings LIMIT ($1)';
            client.query(sql, [number], function(err, result) {
                if(err) {
                    drop();
                    logger.error(err, "Error");
                    return res.status(500).json({message: "server error"});
                }
                else {
                    return res.status(200).json({data : result.rows})
                }

            });
        }
    });
};

exports.serviceByMerchantID = function(req, res) {
    var merchantId = req.params.merchantId;
    var number = req.query.nums || 10;
    if(!merchantId) {
        return res.status(400).json({message: "merchantId parameter is missing in the request"});
    }
    else {
        db.services.findAll({where: { merchant_id: merchantId }, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'phone_number'] } ], limit : number }).then(function(services) {
            var serviceList = [];
            var serviceLen = services.length;
            logger.info(serviceLen, "length")
            if(services && serviceLen > 0) {
                _.forEach(services, function(service, key) {
                    db.images.findAll({where: {service_id : service.id} }).then(function (images) {
                        service.dataValues.images = images;

                        db.review_ratings.findAll({where: {service_id : service.id}, limit: 20, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'image_url'] } ] }).then(function (reviews) { 
                            service.dataValues.reviews = reviews;
                            serviceList.push(service);
                            
                            if((key + 1) == serviceLen) {
                                return res.status(200).json(serviceList);
                            }
                        });
                    }, function(err) {
                        logger.error(err, " error while retrieving images");
                    });
                });
            }
            else {
                return res.status(200).json([]);
            }
        }, function(err) {
            logger.error(err, " error while searching service by merchant");
            return res.status(400).json({message : "Unknown Error"})
        });
    }
};


exports.serviceByID = function(req, res, next, id) {
    db.services.find({where: { id: id }, include: [ { model: db.User, attributes: ['displayname', 'firstname', 'lastname', 'phone_number'] } ] }).then(function(service) {
        if (!service) return next(new Error('Failed to load service ' + id));
        req.service = service;
        next();
    }, function(err) {
        return next(err);
    });
};


exports.isOwner = function(req, res, next) {
    if (req.service.UserId !== req.user.id) {
        return res.status(403).json({
            message: 'User is not authorized'
        });
    }
    next();
};

