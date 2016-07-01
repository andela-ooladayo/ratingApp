'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$location','User', 'Authentication','Message', 'Services',
    function($scope, $stateParams, $location,User, Authentication,Message, Services) {
        $scope.user = User.get();

        $scope.create = function() {
            var service = new Services({
                title: this.title,
                content: this.content
            });
            service.$save(function(response) {
                Message.success('Service','Service successfully created');
                $location.path('services/' + response.id);

                $scope.title = '';
                $scope.content = '';
            }, function(errorResponse) {
                Message.error('Service',errorResponse.data.message);
            });
        };

        $scope.remove = function(service) {
            if (service) {
                service.$remove();

                for (var i in $scope.services) {
                    if ($scope.services[i] === service) {
                        $scope.services.splice(i, 1);
                    }
                }
            } else {
                $scope.service.$remove(function() {
                    $location.path('services');
                });
            }
        };

        $scope.update = function() {
            var service = $scope.service;

            service.$update(function() {
                Message.success('Service','Service successfully updated');
                $location.path('services/' + service.id);
            }, function(errorResponse) {
                Message.error('Service',errorResponse.data.message);
            });
        };

        $scope.find = function() {
            $scope.services = Services.query();
        };

        $scope.findOne = function() {
            $scope.service = Services.get({
                serviceId: $stateParams.serviceId
            });
        };
    }
]);
