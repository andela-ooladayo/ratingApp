'use strict';

//Services service used for communicating with the services REST endpoints
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
