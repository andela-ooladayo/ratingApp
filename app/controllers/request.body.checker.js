var _ = require('lodash');

module.exports = function(params, requiredFields) {
    var errors = {};
    for(var i = 0; i < requiredFields.length; i++) {
        if(!params[requiredFields[i]]) errors[requiredFields[i]] = 'is required';
    }
    if(_.isEmpty(errors)) {
        return null;
    }
    else {
        return errors;
    }
};
