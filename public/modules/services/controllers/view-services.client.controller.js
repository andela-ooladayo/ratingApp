'use strict';

angular.module('services').controller('ViewServicesController', ['$scope', '$stateParams', '$window', '$location', '$http', 'User', 'Authentication','Message', 'Storage', 'Services', 'ServiceFac', 'Images', 'Reviews', 'Likes',
    function($scope, $stateParams, $window, $location, $http, User, Authentication, Message, Storage, Services, ServiceFac, Images, Reviews, Likes) {
        $scope.user = User.get();
        console.log($scope.user);

        $scope.categories = [
          "Agriculture & Agro-Allied",
          "Banking & Finance (banks)",
          "Business Services",
          "ICT",
          "Educational",
          "Events & Entertainment",
          "Nightlife and clubs",
          "Fashion & Style",
          "Food & Beverages",
          "Maintenance Services",
          "Manufacturing & Production",
          "Medicine & Health",
          "Pharmaceutical companies",
          "Newspapers & Media",
          "Oil & Gas",
          "People & Society",
          "Professional Services",
          "Construction/Real Estate",
          "Religious Organisations",
          "Telecommunications",
          "Travel & Tourism",
          "Hotels",
          "Restaurants",
          "Industrial Goods",
          "Consumer Goods",
          "Services",
          "Utilities",
        ];
        
        $scope.rating = 0;
        $scope.rateFunction = function(rating) {
            $scope.rating = rating;
        };

        $scope.reset = function() {
            $scope.rating = 0;
            this.review = "";
        }

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


        $scope.findOne = function() {
            $scope.avg_rating = 0;
            $scope.service = Services.get({
                serviceId: $stateParams.serviceId
            }, function() {
                console.log($scope.service);
                $scope.reviews = $scope.service.reviews;
                var len = $scope.reviews.length;
                var total = 0;
                $scope.reviews.forEach(function(review) {
                    total += review.value;
                });
                $scope.avg_rating += Math.round(total/len);
                console.log($scope.avg_rating);
            });
            console.log($scope.service);
        };

        $scope.createReview = function() {
            var review = new Reviews({
                service_id: $scope.service.id,
                value: $scope.rating,
                review: this.review,
                user_id: $scope.user.id
            });
            console.log(review);
            review.$save(function(response) {
                Message.success('Review','successfully added review');
                $location.path('services/' + $scope.service.id);
                $window.location.reload();
            }, function(errorResponse) {
                Message.error('Review',errorResponse.data.message);
            });
        };

        $scope.like = function(param) {
            console.log("liked", param);
            Likes.like(param);
        }

        $scope.dislike = function(param) {
            console.log("disliked", param);
            Likes.dislike(param);
        }

    }
]);