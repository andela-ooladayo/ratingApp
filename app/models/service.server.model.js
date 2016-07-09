'use strict';

module.exports = function(sequelize, DataTypes) {
    var services = sequelize.define('services', {
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        merchant_id: {
            type: DataTypes.INTEGER,
            references: { model: "Users", key: "id" }
        },
        business_name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
            validate: { notEmpty: true}
        },
        business_website: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        business_description: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        business_email: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        business_phone_number: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        business_address: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        business_address_street: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        business_address_city: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        business_address_state: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        business_address_country: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        business_category_id : {
            type: DataTypes.INTEGER
        },
        business_lat : {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        business_long : {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        no_of_rating_five : {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        no_of_rating_four : {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        no_of_rating_three : {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        no_of_rating_two : {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        no_of_rating_one : {
            type: DataTypes.BIGINT,
            defaultValue: 0
        }
    },
    {
        associate: function(models){
            services.belongsTo(models.User);
        }
    });
    return services;
};
