'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', 'Services',
	function($scope, Authentication, $http, Services) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
    
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

    $scope.default_view = function() {
      
      $scope.idx = 0;
      $scope.view_tab = $scope.categories[$scope.idx];
      getServiceByCategory(0);
    }

    $scope.changeTab = function(tab) {
      $scope.view_tab = tab;
      $scope.idx = $scope.categories.indexOf(tab);
      // console.log(idx);
      getServiceByCategory($scope.idx)
    }

    var getServiceByCategory = function(idx) {
      $scope.categoryArr = [];
      $http.get('/api/service/category/' + idx).success(function(response) {
        response.forEach(function(service) {
            var service = Services.get({
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
    }

    $scope.getTopRated = function() {
      $scope.topRated = [];
      $http.get('/api/service/top-rated').success(function(response) {
        response.data.forEach(function(service) {
            var service = Services.get({
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
                    $scope.topRated.push(service); 
                }
                else {
                    service.avg_rating = 0;
                    $scope.topRated.push(service);
                }
            });

        });

      }).error(function(response) {
        console.log(response);
      });
    }


    // $("#top").backstretch("http://dl.dropbox.com/u/515046/www/garfield-interior.jpg");
	}
]);