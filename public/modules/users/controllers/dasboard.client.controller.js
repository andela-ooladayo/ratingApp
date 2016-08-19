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
                $scope.labels = ["Users", "Merchants", "Businesses", "Reviews"];
                $scope.data = [$scope.stats.total_users, $scope.stats.total_merchants, $scope.stats.total_services, $scope.stats.total_reviews];
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

        $scope.findResult = function() {
            // this function is not defined
            this.willNeverWork();
        }



        $scope.approveMerchant = function(req) {
            Merchant.approve(req);
        }

        $scope.labels1 = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        $scope.series = ['Users', 'Merchants', 'Reviews', 'Services'];
        $scope.data1 = [
          [65, 59, 80, 81, 56, 55, 40],
          [28, 48, 40, 19, 86, 27, 90],
          [34, 23, 87, 12, 64, 34, 22],
          [83, 65, 65, 33, 65, 23, 87]
        ];
        $scope.onClick = function(points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
          scales: {
              yAxes: [{
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
              }, {
                  id: 'y-axis-2',
                  type: 'linear',
                  display: true,
                  position: 'right'
              }]
            }
        };


    }
]);
