'use strict';

//Services service used for communicating with the services REST endpoints
angular.module('services').factory('ServiceFac', ['$resource',
    function($resource) {
        return $resource('service/:serviceId');
    }
]);

