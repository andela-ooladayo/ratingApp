'use strict';

angular.module('services').controller('CategoriesController', ['$scope', '$stateParams', '$window', '$location', '$http', 'User', 'Authentication','Message', 'Storage', 'Services', 'ServiceFac', 'Images', 'Reviews', 'Likes',
    function($scope, $stateParams, $window, $location, $http, User, Authentication, Message, Storage, Services, ServiceFac, Images, Reviews, Likes) {

        $scope.authentication = Authentication;
        $scope.isAuthenticated = Authentication.isAuthenticated();

        $scope.categories = [
          "Agro-Allied",
          "Banking & Finance",
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

        console.log($stateParams);
        $scope.categoryArr = [];

        $scope.setFilter = function(param) {
            $scope.filter = param;
        }

        // $scope.getCategory = function() {

        // }
        $http.get('/service/category/' + $stateParams.categoryId).success(function(response) {
            $scope.category = $scope.categories[$stateParams.categoryId];
            console.log(response);
            response.forEach(function(service) {
                var service = ServiceFac.get({
                    serviceId: service.id
                }, function() {
                    var len = service.reviews.length;
                    var total = 0;
                    if(service.reviews.length > 0) {
                        service.reviews.forEach(function(review) {
                            total += review.value;
                        });
                        service.avg_rating = Math.round(total/len);
                        // console.log(service);
                        $scope.categoryArr.push(service); 
                    }
                    else {
                        service.avg_rating = 0;
                        $scope.categoryArr.push(service);
                    }
                });

            });
        }).error(function(response) {
            console.log(response);
        });

        $scope.getTopReviews = function() {
          $scope.topReviews = [];
          $http.get('/service/top-reviews').success(function(response) {
            response.data.forEach(function(review) {
                // console.log(review);
                var res = ServiceFac.get({
                    serviceId: review.service_id
                }, function() {
                    review.img = res.images[0].url
                    $scope.topReviews.push(review);
                });

            });

          }).error(function(response) {
            console.log(response);
          });
        }

        $('#cat').on('change', function() {
          $scope.categoryArr = [];
          var val = this.value;
          $http.get('/service/category/' + val).success(function(response) {
              $scope.category = $scope.categories[val];
              console.log(response);
              response.forEach(function(service) {
                  var service = ServiceFac.get({
                      serviceId: service.id
                  }, function() {
                      var len = service.reviews.length;
                      var total = 0;
                      if(service.reviews.length > 0) {
                          service.reviews.forEach(function(review) {
                              total += review.value;
                          });
                          service.avg_rating = Math.round(total/len);
                          // console.log(service);
                          $scope.categoryArr.push(service); 
                      }
                      else {
                          service.avg_rating = 0;
                          $scope.categoryArr.push(service);
                      }
                  });

              });
          }).error(function(response) {
              console.log(response);
          });
        })

    }
]);