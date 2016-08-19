'use strict';

angular.module('services').controller('SearchController', ['$scope', '$stateParams', '$window', '$location', '$http', 'User', 'Authentication','Message', 'Storage', 'Services', 'ServiceFac', 'Images', 'Reviews', 'Likes',
    function($scope, $stateParams, $window, $location, $http, User, Authentication, Message, Storage, Services, ServiceFac, Images, Reviews, Likes) {
        $scope.authentication = Authentication;
        $scope.isAuthenticated = Authentication.isAuthenticated();

        $scope.user = User.get();
        
        $http.get('services/search', {params: $stateParams}).success(function(response) {
            $scope.searchTerm = $stateParams.q
            $scope.searchResult = response;
        }).error(function(response) {
            console.log(response);
        })


    }
]);