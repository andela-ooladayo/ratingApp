'use strict';

var crypto = require('crypto');

var validateLocalStrategyProperty = function(property) {
    if( ((this.provider !== 'local' && !this.updated) || property.length!==0) === false ){
        throw new Error('Local strategy failed');
    }
};

var validateLocalStrategyPassword = function(password) {
    if( (this.provider !== 'local' || (password && password.length > 6)) === false ){
        throw new Error('One field is missing');
    }
};

module.exports = function(sequelize, DataTypes) {

    var User = sequelize.define('User', {
            created: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            updated: {
                type: DataTypes.DATE
            },
            firstname: {
                type: DataTypes.STRING,
                defaultValue: '',
                validate: { isValid: validateLocalStrategyProperty}
            },
            lastname: {
                type: DataTypes.STRING,
                defaultValue: '',
                validate: { isValid: validateLocalStrategyProperty}
            },
            displayname: {
                type: DataTypes.STRING,
                defaultValue: ''
            },
            phone_number: {
                type: DataTypes.STRING,
                defaultValue: ''
            },
            email: {
                type: DataTypes.STRING,
                //unique: true,
                defaultValue: ''
                //validate: { isEmail: { msg: 'Please fill a valid email address}' },
                    //isValid: validateLocalStrategyProperty}
            },
            password: {
                type: DataTypes.STRING,
                default: '',
                validate: { isValid: validateLocalStrategyPassword}
            },
            facebook_id: {
                type: DataTypes.STRING,
                defaultValue: ''
            },
            linkedin_id: {
                type: DataTypes.STRING,
                defaultValue: ''
            },
            image_url: {
                type: DataTypes.STRING
            },
            salt: {
                type: DataTypes.BLOB('tiny')
            },
            provider: {
                type: DataTypes.STRING,
                allowNull: false
            },
            providerData: {
                type: DataTypes.TEXT
            },
            additionalProvidersData: {
                type: DataTypes.TEXT
            },
            roleTitle: {
                type: DataTypes.STRING
            },
            roleBitMask: {
                type: DataTypes.INTEGER
            },
            reset_password_token: {
                type: DataTypes.STRING
            },
            reset_password_expires: {
                type: DataTypes.DATE
            }

        },
        {
            classMethods: {
                findUniqueEmail : function(email, suffix, callback) {
                    var _this = this;
                    var possibleEmail = email + (suffix || '');

                    _this.find({
                        email: possibleEmail
                    }).then(function (user) {
                        if (!user) {
                            callback(possibleEmail);
                        } else {
                            return _this.findUniqueEmail(email, (suffix || 0) + 1, callback);
                        }
                    }, function() {
                        callback(null);
                    });
                }
            }
        });
    return User;
};
