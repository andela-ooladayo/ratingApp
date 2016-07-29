'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Merchant', ['$resource', '$http', 'Message',
    function($resource, $http, Message) {

        // var waiting_list;
        
        var api_call = $resource('/api/merchant/waiting_list');

        var getList = api_call.query(function(response) {
            console.log("api response is ", response)
            return response;
        });  


        var approve = function(params) {
            console.log(params);
            $http.post('/api/merchant/approve', params).success(function(response) {
                console.log(response);
                // $scope.findMerchantList();
                Message.success('Merchant', 'Request to be a merchant by '+ params.firstname + ' has been approved Successfully.');
            }).error(function(response) {
                console.log(response);
                Message.error('Failed to send',response.message);
            });
        };

        var request = function(params) {
            console.log(params);
            $http.post('/api/merchant/request', params).success(function(response) {
                console.log(response);
                Message.success('Merchant', 'Request to be a merchant by '+ params.displayname + ' has been sent Successfully.');
            }).error(function(response) {
                console.log(response);
                Message.error('Failed to send',response.message);
            });
        }

        return {
            waiting_list: waiting_list,
            getList: getList,
            approve: approve,
            request: request
        }
    }
]);