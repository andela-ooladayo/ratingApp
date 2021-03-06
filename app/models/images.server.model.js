'use strict';

module.exports = function(sequelize, DataTypes) {
    var Images = sequelize.define('images', {
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        service_id : {
            type: DataTypes.INTEGER
        },
        url: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false,
            validate: { notEmpty: true}
        }
    });
    return Images;
};
