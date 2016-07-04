'use strict';

//Services service used for communicating with the services REST endpoints
angular.module('services').factory('Services', ['$resource',
    function($resource) {
        return $resource('api/service/:serviceId', {
            serviceId: '@id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
