var elasticsearch = require('elasticsearch');
var moment = require('moment');
var esClient = new elasticsearch.Client({
    host: 'localhost:9200'
});

exports.create = createRecordES;
// exports.update = createRecordES;
// exports.delete = deleteRecordES;


function createRecordES(data, id) {
    var esBody = data;
    esBody.counter = 1;
   
    esClient.create({
        index: 'raytee',
        type: 'services',
        id: id,
        body: esBody
    }).then(function (response) {
        logger.info("successfully add info to ES @ " + moment().format("DD-MMM-YYYY, HH:MM"), response);
    }, function (err) {
        if(error) logger.error(error);
    });
};