'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
    $("#top").backstretch("http://dl.dropbox.com/u/515046/www/garfield-interior.jpg");
	}
]);