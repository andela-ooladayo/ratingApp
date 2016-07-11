'use strict';

//Reviews service used for communicating with the reviews REST endpoints
angular.module('services').factory('Reviews', ['$resource',
    function($resource) {
        return $resource('/api/review-ratings');
    }
]);
