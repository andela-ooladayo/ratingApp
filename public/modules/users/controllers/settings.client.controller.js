'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$rootScope', '$state', '$http', '$location', '$timeout', 'Users', 'Authentication','User','Message','Storage', 'Merchant',
	function($scope, $rootScope, $state, $http, $location, $timeout, Users, Authentication, User, Message, Storage, Merchant) {
		$scope.user = User.get();

		console.log($scope.user);
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
			Merchant.request($scope.user);
		}
		$scope.findMerchantList = function() {
			$scope.waitingList = Merchant.getList();
		}

		console.log(Merchant);


		$scope.approveMerchant = function(req) {
			Merchant.approve(req);
		}

		angular.element('.profile-pic').click(function() {
			angular.element('#my_file').click();
		});

		$('#my_file').on('change', function() {
			var files = document.getElementById('my_file').files;
			var file = files[0];
		    if (file == null) {
		        return alert('No file selected.');
		    }
		    getSignedRequest(file);

		});

		function getSignedRequest(file) {
			var xhr;
		    if (window.ActiveXObject) {
		        xhr = new ActiveXObject("Microsoft.XMLHTTP");
		    }
		    else{
			    xhr = new XMLHttpRequest();	
		    }

            var token = angular.fromJson(Storage.get('auth_token')).token;

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

            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
		    xhr.send();
		}

		function uploadFile(file, signedRequest, url) {
		    var xhr = new XMLHttpRequest();
		    xhr.open('PUT', signedRequest);
		    xhr.onreadystatechange = function() {
		        if (xhr.readyState === 4) {
		            if (xhr.status === 200) {
		                $('.profile-pic').attr('src', url);
		                $scope.user.image_url = url;
		                $scope.updateUserProfile(true);
		                alert('finished');
		            } else {
		                alert('Could not upload file.');
		            }
		        }
		    };
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
		    xhr.send(file);
		}

	}
]);
