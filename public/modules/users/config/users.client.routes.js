'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
        var access = roleManager.accessLevels;
		$stateProvider.
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html',
                data : {
                    access : access.user
                }
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/accounts.client.view.html',
                data : {
                    access : access.user
                }
		}).
        state('accounts.dashboard', {
            url: '/dashboard',
            templateUrl: 'modules/users/views/settings/dashboard.client.view.html',
                data : {
                    access : access.user
                }
        }).
        state('accounts.service', {
            url: '/service',
            templateUrl: 'modules/users/views/settings/service.client.view.html',
                data : {
                    access : access.user
                }
        }).
        state('accounts.service.create', {
            url: '/create-service',
            templateUrl: 'modules/users/views/settings/create-service.client.view.html',
                data : {
                    access : access.user
                }
        }).
        state('accounts.profile', {
            url: '/profile',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html',
                data : {
                    access : access.user
                }
        }).
        state('accounts.review', {
            url: '/review',
            templateUrl: 'modules/users/views/settings/review.client.view.html',
                data : {
                    access : access.user
                }
        }).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html',
                data : {
                    access : access.anon
                }
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html',
                data : {
                    access : access.anon
                }
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html',
                data : {
                    access : access.anon
                }
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html',
                data : {
                    access : access.anon
                }
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html',
                data : {
                    access :access.anon
                }
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html',
                data : {
                    access : access.anon
                }
		});
	}
]);
