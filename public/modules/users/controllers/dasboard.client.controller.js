'use strict';

angular.module('users').controller('DashboardController', ['$scope', '$rootScope', '$state', '$http', '$location', '$timeout', 'Users', 'Authentication','User','Message','Storage', 'Merchant',
    function($scope, $rootScope, $state, $http, $location, $timeout, Users, Authentication, User, Message, Storage, Merchant) {
        $scope.user = User.get();

        console.log($scope.user);
        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        $scope.getStats = function() {
            $http.get('/api/stats').success(function(response) {
                console.log(response);
                $scope.stats = response;
            }).error(function(response) {
                console.log(response);
            });
            
        }

        $scope.findMerchantList = function() {

            Merchant.getList().then(function(response) {
                $scope.waitingList = response
                console.log($scope.waitingList);
            });
        };



        $scope.approveMerchant = function(req) {
            Merchant.approve(req);
        }

    }
]);