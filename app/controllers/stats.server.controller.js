'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    errorHandler = require('./errors'),
    pg = require('pg'),
    connectionString = process.env.DATABASE_URL || "postgres://project:nifemi00@localhost/rating-app",
    searchEngine = require('./search.engine.server.controller'),
    checkRequestBody = require('./request.body.checker');


exports.getStats = function(req, res) {
    var sql = '(SELECT COUNT(id) AS count FROM "Users") UNION ALL (SELECT COUNT(id) AS count FROM "Users" WHERE "roleTitle"=$1) UNION ALL (SELECT COUNT(id) AS count FROM "services") UNION ALL  (SELECT COUNT(id) AS count FROM "review_ratings")';

    pg.connect(connectionString, function(err, client, drop) {
        if(err) {
            logger.error(err);
            return res.status(500).json({message: 'Unknown Error'});
        }

        client.query(sql, ['merchant'], function(err, result) {
            if(err) {
                logger.error(err, "stats-error");
                return res.status(400).json({message: 'Unknown Error'});
            }
            else {
                var stats = {};
                stats.total_users = result.rows[0].count;
                stats.total_merchants = result.rows[1].count;
                stats.total_services = result.rows[2].count;
                stats.total_reviews = result.rows[3].count;
                return res.status(200).json(stats);
            }
        });
    });
};
