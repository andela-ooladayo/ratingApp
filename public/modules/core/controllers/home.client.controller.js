'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', 'ServiceFac', 'User',
	function($scope, Authentication, $http, ServiceFac, User) {
		// This provides Authentication context.
    $scope.user = User.get();
		$scope.authentication = Authentication;
    $scope.isAuthenticated = Authentication.isAuthenticated();
    
    $scope.categories = [
      { name: "Agro-Allied", image: "/modules/core/img/agric.jpg" },
      { name: "Banking & Finance", image: "/modules/core/img/biz_service.jpg" },
      { name: "Business Services", image: "/modules/core/img/business.jpg" },
      { name: "ICT", image: "/modules/core/img/ict.jpg" },
      { name: "Educational", image: "/modules/core/img/edu.jpg" },
      { name: "Events & Entertainment", image: "/modules/core/img/events.jpg" },
      { name: "Nightlife and clubs", image: "/modules/core/img/nightlife.jpg" },
      { name: "Fashion & Style", image: "/modules/core/img/fashion.jpg" },
      { name: "Food & Beverages", image: "/modules/core/img/food.jpg" },
      { name: "Restaurants", image: "/modules/core/img/restaurant.jpg" },
      { name: "Hotels", image: "/modules/core/img/hotels.jpg" },
      "Maintenance Services",
      "Manufacturing & Production",
      "Medicine & Health",
      "Pharmaceutical companies",
      "Newspapers & Media",
      "Oil & Gas",
      "People & Society",
      "Professional Services",
      { name: "Construction/Real Estate", image: "/modules/core/img/construction.jpg" },
      "Religious Organisations",
      "Telecommunications",
      "Travel & Tourism",
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
      $http.get('/service/category/' + idx).success(function(response) {
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
    }

    $scope.getTopRated = function() {
      $scope.topRated = [];
      $http.get('/service/top-rated').success(function(response) {
        response.data.forEach(function(service) {
            $scope.topRated.push(service);
        });

      }).error(function(response) {
        console.log(response);
      });
    }

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


    $("#top").backstretch(["/modules/core/img/bg2.jpg", "/modules/core/img/bg1.jpg", "/modules/core/img/bg3.jpg"], {duration:3000, fade: 750});
	}
]);