var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var _         = require('lodash');
var config    = require('./config');
var db        = {};

if(process.env.DATABASE_URL) {
    var sequelize = new Sequelize(process.env.DATABASE_URL);
}
else {
    var sequelize = new Sequelize(config.db.dbName, config.db.username, config.db.password, {
        dialect: config.db.dialect,
        port:   config.db.port,
        logging : false
    });
}

sequelize
    .authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.');
    }, function (err) { 
        console.log('Unable to connect to the database:', err);
    });


fs.readdirSync(config.modelsDir)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'session.server.model.js');
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(config.modelsDir, file));
        db[model.name] = model;
    })

// invoke associations on each of the models
Object.keys(db).forEach(function(modelName) {
    if (db[modelName].options.hasOwnProperty('associate')) {
        db[modelName].options.associate(db)
    }
});

//sync database
sequelize
    .sync({force: false})
    .then(function(err) {
        console.log("Database sync successfully");
    }, function (err) { 
        console.log("An error occured %j", err);
    });


module.exports = _.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);
