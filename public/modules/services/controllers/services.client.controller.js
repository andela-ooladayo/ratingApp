'use strict';

angular.module('services').controller('ServicesController', ['$scope', '$stateParams', '$window', '$location', '$http', 'User', 'Authentication','Message', 'Storage', 'Services', 'Images', 'Reviews',
    function($scope, $stateParams, $window, $location, $http, User, Authentication, Message, Storage, Services, Images, Reviews) {
        $scope.user = User.get();
        console.log($scope.user);
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
                        $scope.isLoading = false;
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
                        $scope.createService(image_url);
                        // image_url = url;
                        // alert('finished');
                    } else {
                        alert('Could not upload file.');
                    }

                }
            };
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.send(file);
        }


        $scope.rating = 0;
        $scope.rateFunction = function(rating) {
            $scope.rating = rating;
        };

        $scope.reset = function() {
            $scope.rating = 0;
            this.review = "";
        }

        $scope.create = function() {

            var files = document.getElementById('service_img').files;
            var file = files[0];
            if (file == null) {
                return alert('No file selected.');
            }
            getSignedRequest(file);
            $scope.isLoading = true;
        }

        $scope.createService = function(image_url) {
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
                    $scope.isLoading = false;
                });
                Message.success('Service','Service successfully created');
                $location.path('services/' + response.id);

                $scope.title = '';
                $scope.content = '';
            }, function(errorResponse) {
                Message.error('Service',errorResponse.data.message);
                $scope.isLoading = false;
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
            $scope.serviceArray = [];
            Services.query(function(response) {
                var service;
                response.forEach(function(service) {
                    service = Services.get({
                        serviceId: service.id
                    }, function() {
                        var len = service.reviews.length;
                        var total = 0;
                        if(service.reviews.length > 0) {
                            service.reviews.forEach(function(review) {
                                total += review.value;
                            });
                            service.avg_rating = Math.round(total/len);
                            $scope.serviceArray.push(service); 
                        }
                        else {
                            service.avg_rating = 0;
                            $scope.serviceArray.push(service);
                        }
                    });

                });
                $scope.serviceArray.forEach(function(service) {
                });

            });
        };

        $scope.findOne = function() {
            $scope.avg_rating = 0;
            $scope.service = Services.get({
                serviceId: $stateParams.serviceId
            }, function() {
                $scope.reviews = $scope.service.reviews;
                var len = $scope.reviews.length;
                var total = 0;
                $scope.reviews.forEach(function(review) {
                    total += review.value;
                });
                $scope.avg_rating += Math.round(total/len);
                console.log($scope.avg_rating);
            });
            console.log($scope.service);
        };

        $scope.findMy = function(index) {
            $scope.services = [];
            $http.get('api/service/merchant/' + index).success(function(response) {
                response.forEach(function(service) {
                    var len = service.reviews.length;
                    var total = 0;
                    if(service.reviews.length > 0) {
                        service.reviews.forEach(function(review) {
                            total += review.value;
                        });
                        service.avg_rating = Math.round(total/len);
                        // console.log(service);
                        $scope.services.push(service); 
                    }
                    else {
                        service.avg_rating = 0;
                        $scope.services.push(service);
                    }

                });
            }).error(function(errorResponse) {
                console.log(errorResponse);
            })
        };

        $scope.createReview = function() {
            var review = new Reviews({
                service_id: $scope.service.id,
                value: $scope.rating,
                review: this.review,
                user_id: $scope.user.id
            });
            console.log(review);
            review.$save(function(response) {
                Message.success('Review','successfully added review');
                $location.path('services/' + $scope.service.id);
                $window.location.reload();
            }, function(errorResponse) {
                Message.error('Review',errorResponse.data.message);
            });
        };

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
            restrict: 'A',
            template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' +
            '</ul>',
            scope: {
                ratingValue: '=',
                max: '=',
                readonly: '@',
                onRatingSelected: '&'
            },
            link: function(scope, elem, attrs) {

                var updateStars = function() {
                    scope.stars = [];
                    for (var i = 0; i < scope.max; i++) {
                        scope.stars.push({ filled: i < scope.ratingValue });
                    }
                };

                scope.toggle = function(index) {
                    if (scope.readonly && scope.readonly === 'true') {
                        return;
                    }
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({ rating: index + 1 });
                };

                scope.$watch('ratingValue', function(oldVal, newVal) {
                    if (newVal || newVal == 0) {
                        updateStars();
                    }
                });
            }
        };
    }
).directive('convertToNumber', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(val) {
          return parseInt(val, 10);
        });
        ngModel.$formatters.push(function(val) {
          return '' + val;
        });
      }
    };
});
