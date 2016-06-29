'use strict';

angular.module('users').controller('AuthenticationController', ['$scope','$rootScope', '$http', '$location', 'Authentication','Storage','Message',
	function($scope,$rootScope, $http, $location, Authentication,Storage,Message) {

		// If user is signed in then redirect back home
		if (Authentication.isAuthenticated()) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
                Storage.set('auth_token',response);
                $rootScope.$broadcast('Auth');
                Message.success('Login','Welcome '+ response.user.displayname);
				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
                Message.error('Failed to register',response.message);
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
                Storage.set('auth_token',response);
                $rootScope.$broadcast('Auth');
                
                Message.success('Login','Welcome '+ response.user.displayname);
				
				$location.path('/');
			}).error(function(response) {
                Message.error('Failed to login',response.message);
			});
		};

        $scope.facebookLogin = function() {
            FB.login(function(response) {
                if (response.status === 'connected') {
                    FB.api('/me', {fields: "last_name, first_name, id, email, gender, link, locale, name, picture"}, function(response) {
                       var body = {};
                       body.firstname = response.first_name;
                       body.lastname = response.last_name;
                       body.facebook_id = response.id;
                       body.email = response.email;
                       body.image_url = response.picture.data.url;
           
                       $http.post('/auth/facebook', body).success(function(response) {
                            Storage.set('auth_token', response);
                            $rootScope.$broadcast('Auth');
                            Message.success('Login','Welcome '+ response.user.displayname);
                            $location.path('/');
                        }).error(function(response) {
                            Message.error('Failed to login', response.message);
                        });
                    });

                } else if (response.status === 'not_authorized') {
                    Message.error('Not authorized');
                } else {
                   Message.error('Fail to login through facebook');
                } 
            }, {scope: 'public_profile,email'});
        };



        //IN.Event.on(IN, "auth", OnLinkedInAuth);

        function OnLinkedInAuth() {
            IN.API.Profile("me").result(ShowProfileData);
        }

        function ShowProfileData(profiles) {
            var member = profiles.values[0];
            var body = {};
            body.linkedin_id = member.id;
            body.firstname = member.firstName;
            body.lastname = member.lastName;
            body.image_url = member.pictureUrl;
            $http.post('/auth/linkedin', body).success(function(response) {
                Storage.set('auth_token', response);
                $rootScope.$broadcast('Auth');
                Message.success('Login','Welcome '+ response.user.displayname);
                $location.path('/');
            }).error(function(response) {
                Message.error('Failed to login', response.message);
            });
        }

        $scope.linkedinLogin = function() {
            IN.User.authorize(function(response) {
                OnLinkedInAuth();
                console.log("login--in-linkedin")
            });  
        };

	}
]);
