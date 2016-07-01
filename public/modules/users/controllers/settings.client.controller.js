'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$rootScope', '$state', '$http', '$location', '$timeout', 'Users', 'Authentication','User','Message','Storage', 'Merchant',
	function($scope, $rootScope, $state, $http, $location, $timeout, Users, Authentication, User, Message, Storage, Merchant) {
		$scope.user = User.get();

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('api/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
                Storage.set('auth_token',response);
                $rootScope.$broadcast('Auth');
                Message.success('Remove Social Account','Successfully removed social provider.');
			}).error(function(response) {
                Message.error('Failed to Remove Social Account',response.message);
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
	
				user.$update(function(response) {
					$scope.success = true;
                    Storage.set('auth_token',response);
                    $rootScope.$broadcast('Auth');
                    Message.success('Update Profile','Successfully updated your profile.');
				}, function(response) {
                    Message.error('Failed to Update Profile',response.message);
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('api/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
                Message.success('Change Password','Successfully changed  your password.');
			}).error(function(response) {
                Message.error('Failed to change password',response.message);
			});
		};

		$scope.merchantRequest = function() {
			$http.post('/api/merchant/request', $scope.user).success(function(response) {
                console.log(response);
                Message.success('Request to be a merchant by '+ $scope.user.displayname + ' has been sent Successfully.');
				// And redirect to the index page
				// $location.path('/');
			}).error(function(response) {
                Message.error('Failed to send',response.message);
			});
		}

		$scope.findMerchantList = function() {
			Merchant.query(function(response) {
				$scope.waitingList = angular.fromJson(response);
			});
			
		};

		angular.element('.profile-pic').click(function() {
			angular.element('#my_file').click();
		});

		$('#my_file').on('change', function() {
			var file = {};
			file.name = $('#my_file')[0].files[0]['name'];
			file.type = $('#my_file')[0].files[0]['type'];
			console.log(file);
		    if (file == null) {
		        return alert('No file selected.');
		    }
		    getSignedRequest(file);

		});

		function getSignedRequest(file) {
			// console.log(file.name);

		    var xhr = new XMLHttpRequest();
		    xhr.open('GET', '/api/sign_s3?file_name='+file.name+'&file_type='+file.type, true);
		    xhr.onreadystatechange = function(){
		        if (xhr.readyState === 4) {
		            if (xhr.status === 200) {
		                var response = JSON.parse(xhr.responseText);
                        console.log(response, "response");
		                uploadFile(file, response.signed_request, response.url);
		            } else {
		                alert('Could not get signed URL.');
		            }
		        }
		    };
		    xhr.send();
		}

		function uploadFile(file, signedRequest, url) {
		    var xhr = new XMLHttpRequest();
		    xhr.open('PUT', signedRequest);
		    xhr.onreadystatechange = function() {
		        if (xhr.readyState === 4) {
		            if (xhr.status === 200) {
		                $('.profile-pic').attr('src', url);
		                $('#avatar-url').val(url);
		            } else {
		                alert('Could not upload file.');
		            }
		        }
		    };
		    xhr.send(file);
		}

	}
]);
