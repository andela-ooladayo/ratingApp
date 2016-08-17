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

        $scope.config = {
            title: 'Products',
            tooltips: true,
            labels: false,
            mouseover: function() {},
            mouseout: function() {},
            click: function() {},
            legend: {
                display: true,
                //could be 'left, right'
                position: 'right'
            }
        };

        $scope.data = {
            series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
            data: [{
                x: "Laptops",
                y: [100, 500, 0],
                tooltip: "this is tooltip"
            }, {
                x: "Desktops",
                y: [300, 100, 100]
            }, {
                x: "Mobiles",
                y: [351]
            }, {
                x: "Tablets",
                y: [54, 0, 879]
            }]
        };

    }
]);
