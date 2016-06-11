'use strict';

module.exports = function(sequelize, DataTypes) {
    var like_dislikes = sequelize.define('like_dislikes', {
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        review_id : {
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        l_type: {
            type: DataTypes.STRING
        }
    });
    return like_dislikes;
};
