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

            searchEngine.update(service, service.id);
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

            searchEngine.delete(service.id);
        }
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
            var sql = 'SELECT * FROM (SELECT review_ratings.id, review_ratings.created, review_ratings.value, review_ratings.review, review_ratings.no_of_likes, review_ratings.no_of_dislikes, review_ratings.user_id, review_ratings.service_id, services.business_name, "Users".firstname, "Users".lastname FROM review_ratings LEFT JOIN "Users" ON "Users".id=review_ratings.user_id LEFT JOIN services ON services.id=review_ratings.service_id ORDER BY no_of_likes DESC) AS review_ratings LIMIT ($1)';
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

