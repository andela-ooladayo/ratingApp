var elasticsearch = require('elasticsearch');
var moment = require('moment');
var esClient = new elasticsearch.Client({
    host: 'localhost:9200'
});

exports.create = createRecordES;
exports.update = updateRecordES;
exports.delete = deleteRecordES;
exports.search = searchRecordES;
exports.filter = filterRecordES;



function createRecordES(data, id) {
    var esBody = data;
    esBody.counter = 1;
   
    esClient.create({
        index: 'raytee',
        type: 'services',
        id: id,
        body: esBody
    }).then(function (response) {
        logger.info("successfully added info to ES @ " + moment().format("DD-MMM-YYYY, HH:MM"), response);
    }, function (err) {
        if(error) logger.error(error);
    });
};


function updateRecordES(data, id) {
    var esBody = data;
   
    esClient.update({
        index: 'raytee',
        type: 'services',
        id: id,
        body: {
            doc: esBody
        }
    }).then(function (response) {
        logger.info("successfully updated info to ES @ " + moment().format("DD-MMM-YYYY, HH:MM"), response);
    }, function (err) {
        if(error) logger.error(error);
    });
};


function deleteRecordES(id) {
    esClient.delete({
        index: 'raytee',
        type: 'services',
        id: id
    }).then(function (response) {
        logger.info("successfully delete info on ES @ " + moment().format("DD-MMM-YYYY, HH:MM"), response);
    }, function (err) {
        if(error) logger.error(error);
    });
};


function searchRecordES(queryValue, callback) {
    esClient.search({
        index: 'raytee',
        type: 'services',
        q: queryValue
    }).then(function (response) {
        callback(null, response);
    }, function (err) {
        if(error) logger.error(error);
        callback(err);
    });
};


function filterRecordES(queryString, callback) {
    esClient.search({
        index: 'raytee',
        type: 'services',
        q: queryString
    }).then(function (response) {
        logger.info(response);
        callback(null, response);
    }, function (err) {
        if(error) logger.error(error);
        callback(err);
    });
};

