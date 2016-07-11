'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$location','User', 'Authentication','Message', 'Storage', 'Services', 'Images', 'Reviews',
    function($scope, $stateParams, $location,User, Authentication, Message, Storage, Services, Images, Reviews) {
        $scope.user = User.get();
        var image_url = '';

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

        function getSignedRequest(file) {
            var xhr;
            if (window.ActiveXObject) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            else{
                xhr = new XMLHttpRequest(); 
            }

            var token = angular.fromJson(Storage.get('auth_token')).token;

            xhr.open('GET', '/api/sign_s3?file_name='+Date.now()+file.name+'&file_type='+file.type, true);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        console.log(response, "response");
                        image_url = response.url;
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
            var xhr;
            if (window.ActiveXObject) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            else{
                xhr = new XMLHttpRequest(); 
            }
            xhr.open('PUT', signedRequest);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // image_url = url;
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


        $scope.rating = 5;
        $scope.rateFunction = function(rating) {
            // alert('Rating selected - ' + rating);
        };

        $scope.isReadonly = false;

        $scope.create = function() {
            var files = document.getElementById('service_img').files;
            var file = files[0];
            if (file == null) {
                return alert('No file selected.');
            }
            getSignedRequest(file);
            var service = new Services({
                merchant_id: $scope.user.id,
                business_name: this.business_name,
                business_description: this.business_description,
                business_website: this.business_website,
                business_email: this.business_email,
                business_phone_number: this.business_phone_number,
                business_address: this.business_address,
                business_address_street: this.business_address_street,
                business_address_city: this.business_address_city,
                business_address_state: this.business_address_state,
                business_address_country: this.business_address_country,
                business_category_id: this.business_category_id
            });

            service.$save(function(response) {

                var image = new Images({
                    service_id: response.id,
                    url: image_url
                });

                image.$save(function(response) {
                    console.log(response);
                    Message.success('Image','Image successfully uploaded');
                }, function(err) {
                    Message.error('Image', err.data.message);
                });
                Message.success('Service','Service successfully created');
                $location.path('services/' + response.id);

                $scope.title = '';
                $scope.content = '';
            }, function(errorResponse) {
                Message.error('Service',errorResponse.data.message);
            });
        };

        $scope.remove = function(service) {
            console.log(service);
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

        $scope.find = function() {
            $scope.services = Services.query();
            console.log($scope.services);
        };

        $scope.findOne = function() {
            $scope.service = Services.get({
                serviceId: $stateParams.serviceId
            });
        };

        $scope.createReview = function() {
            var review = new Reviews({
                service_id: $scope.service.id,
                value: $scope.rating,
                review: $scope.review,
                user_id: $scope.user.id
            });
            console.log(review);
            review.$save(function(response) {
                $location.path('services/' + service.id);
            }, function(errorResponse) {
                Message.error('Review',errorResponse.data.message);
            });
        }

        $('.dropdown-button').dropdown({
            belowOrigin: true,
            alignment: 'left',
            inDuration: 200,
            outDuration: 150,
            constrain_width: true,
            hover: false,
            gutter: 1
        });

    }
])
.directive('starRating',
    function() {
        return {
            restrict : 'A',
            template : '<ul class="rating">'
                     + '    <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
                     + '\u2605'
                     + '</li>'
                     + '</ul>',
            scope : {
                ratingValue : '=',
                max : '=',
                onRatingSelected : '&',
                readonly: '=?'
            },
            link : function(scope, elem, attrs) {
                var updateStars = function() {
                    scope.stars = [];
                    for ( var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled : i < scope.ratingValue
                        });
                    }
                };
                
                scope.toggle = function(index) {
                    if (scope.readonly == undefined || scope.readonly === false) {

                        scope.ratingValue = index + 1;
                        scope.onRatingSelected({
                            rating : index + 1
                        });
                    }
                };
                
                scope.$watch('ratingValue',
                    function(oldVal, newVal) {
                        if (newVal) {
                            updateStars();
                        }
                    }
                );
            }
        };
    }
);
