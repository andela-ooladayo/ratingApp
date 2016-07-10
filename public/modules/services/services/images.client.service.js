'use strict';

//Images service used for communicating with the images REST endpoints
angular.module('services').factory('Images', ['$resource',
    function($resource) {
        return $resource('/api/images/:imageId', {
            imageId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
