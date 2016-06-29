'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Merchant', ['$resource',
    function($resource) {
        return $resource('/api/merchant/waiting_list');
    }
]);