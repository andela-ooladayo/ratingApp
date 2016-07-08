'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$location','User', 'Authentication','Message', 'Services',
    function($scope, $stateParams, $location,User, Authentication,Message, Services) {
        $scope.user = User.get();

        $scope.rating = 1;
        // $scope.isReadonly = true;
        $scope.rateFunction = function(rating) {
            // alert('Rating selected - ' + rating);
        };

        $scope.rate = 7;
        $scope.max = 10;
        $scope.isReadonly = false;

        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.max);
        };

        // $scope.ratingStates = [
        //     {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
        //     {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
        //     {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
        //     {stateOn: 'glyphicon-heart'},
        //     {stateOff: 'glyphicon-off'}
        // ];

        $scope.create = function() {
            var service = new Services({
                merchant_id: $scope.user.id,
                business_name: this.business_name,
                business_description: this.business_description,
                business_website: this.business_website,
                business_email: this.business_email,
                business_phone_number: this.business_phone_number,
                business_address: this.business_address,
                business_address_street: this.business_address_street,
                business_address_city: this.business_address_city,
                business_address_state: this.business_address_state,
                business_address_country: this.business_address_country,
                business_category_id: this.business_category_id
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

        $('.dropdown-button').dropdown({
            belowOrigin: true,
            alignment: 'left',
            inDuration: 200,
            outDuration: 150,
            constrain_width: true,
            hover: false,
            gutter: 1
        });

    }
])
.directive('starRating',
    function() {
        return {
            restrict : 'A',
            template : '<ul class="rating">'
                     + '    <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
                     + '\u2605'
                     + '</li>'
                     + '</ul>',
            scope : {
                ratingValue : '=',
                max : '=',
                onRatingSelected : '&',
                readonly: '=?'
            },
            link : function(scope, elem, attrs) {
                var updateStars = function() {
                    scope.stars = [];
                    for ( var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled : i < scope.ratingValue
                        });
                    }
                };
                
                scope.toggle = function(index) {
                    if (scope.readonly == undefined || scope.readonly === false) {

                        scope.ratingValue = index + 1;
                        scope.onRatingSelected({
                            rating : index + 1
                        });
                    }
                };
                
                scope.$watch('ratingValue',
                    function(oldVal, newVal) {
                        if (newVal) {
                            updateStars();
                        }
                    }
                );
            }
        };
    }
);
