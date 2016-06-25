'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
    $scope.rate = 7;
    $scope.max = 10;
    $scope.isReadonly = false;

    $scope.hoveringOver = function(value) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / $scope.max);
    };

    $scope.ratingStates = [
      {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
      {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
      {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
      {stateOn: 'glyphicon-heart'},
      {stateOff: 'glyphicon-off'}
    ];
    $scope.view_tab = "home";
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

    $scope.changeTab = function(tab) {
      $scope.view_tab = tab;
    }
    // $("#top").backstretch("http://dl.dropbox.com/u/515046/www/garfield-interior.jpg");
	}
]);