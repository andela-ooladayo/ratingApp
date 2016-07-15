module.exports = function(sequelize, DataTypes) {
    var categories = sequelize.define('categories', {
        name: {
            type: DataTypes.STRING
        }
    });
    return categories;
};