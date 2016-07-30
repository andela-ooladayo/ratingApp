'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Merchant', ['$resource', '$http', '$q', 'Message',
    function($resource, $http, $q, Message) {

        var waiting_list;
        
        var api_call = $resource('/api/merchant/waiting_list');

        // api_call.query(function(response) {
        //     console.log("api response is ", response)
        //     return waiting_list = $q.when(response);
        // });

        var getList = function() {
            return $http.get('/api/merchant/waiting_list').then(function(response) {
                return response.data;
            });
        };


        var approve = function(params) {
            console.log(params);
            $http.post('/api/merchant/approve', params).success(function(response) {
                console.log(response);
                // // $scope.findMerchantList();
                // getList();
                Message.success('Merchant', 'Request approved successfully.');
            }).error(function(response) {
                console.log(response);
                Message.error('Failed to send',response.message);
            });
        };

        var request = function(params) {
            console.log(params);
            $http.post('/api/merchant/request', params).success(function(response) {
                console.log(response);
                Message.success('Merchant', 'Request sent successfully.');
            }).error(function(response) {
                console.log(response);
                Message.error('Failed to send',response.message);
            });
        }

        return {
            getList: getList,
            approve: approve,
            request: request
        }
    }
]);