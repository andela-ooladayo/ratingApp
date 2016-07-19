'use strict';

module.exports = function(sequelize, DataTypes) {
    var ReviewRatings = sequelize.define('review_ratings', {
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        service_id: {
            type: DataTypes.INTEGER,
            references: { model: "services", key: "id" }
        },
        value: {
            type: DataTypes.FLOAT
        },
        review: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        no_of_likes: {
            type: DataTypes.INTEGER
        },
        no_of_dislikes: {
            type: DataTypes.INTEGER
        }
    },
    {
        associate: function(models){
            ReviewRatings.belongsTo(models.User);
        }
    });
    return ReviewRatings;
};
