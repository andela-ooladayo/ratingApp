'use strict';

module.exports = function(sequelize, DataTypes) {
    var MerchantApproval = sequelize.define('merchant_wating_approval', {
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        user_id: {
            type: DataTypes.INTEGER
            //references: { model: "User", key: "id" }
        },
        note: {
            type: DataTypes.TEXT,
            defaultValue: ''
        }
    });
    return MerchantApproval;
};
