'use strict';

angular.module('services').controller('ViewServicesController', ['$scope', '$rootScope', '$stateParams', '$window', '$location', '$http', 'User', 'Authentication','Message', 'Storage', 'Services', 'ServiceFac', 'Images', 'Reviews', 'Likes',
    function($scope, $rootScope, $stateParams, $window, $location, $http, User, Authentication, Message, Storage, Services, ServiceFac, Images, Reviews, Likes) {
        $scope.user = User.get();
        $scope.authentication = Authentication;
        $scope.isAuthenticated = Authentication.isAuthenticated();
        var image_url = '';

        $scope.showReview = false;

        $scope.toggleReview = function() {
            $scope.showReview = !$scope.showReview;
        }

        
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
        
        $scope.rating = 0;
        $scope.rateFunction = function(rating) {
            $scope.rating = rating;
        };

        $scope.reset = function() {
            $scope.rating = 0;
            this.review = "";
        }

        var ratingValue = [{},{comment: "Poor", color: "label-danger"}, {comment: "Ok", color: "label-warning"}, {comment: "Average", color: "label-info"}, {comment: "Very Good", color: "label-primary"}, {comment: "Excellent", color: "label-success"}];

        $scope.starRating1 = 0;
        $scope.click1 = function (param) {
            $scope.rating = param;
        };

        $scope.mouseHover1 = function (param) {
            $scope.hoverRating1 = ratingValue[param].comment;
            $scope.hoverClass = ratingValue[param].color;
        };

        $scope.mouseLeave1 = function (param) {
            $scope.hoverRating1 = ratingValue[param].comment;
            $scope.hoverClass = ratingValue[param].color;
        };

        $scope.percentages;

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
                Message.error('Service','Oops! Something went wrong.');
                $scope.isLoading = false;
            });

        };

        $scope.remove = function(service) {
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

        function isEmpty(obj) {
            for(var prop in obj) {
                if(obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        }

        $scope.finder = function() {
            if(!isEmpty($scope.user)) {
                $scope.findOne(Services);
            } else {
                $scope.findOne(ServiceFac);
            }
        };

            $scope.avg_rating = 0;
        $scope.findOne = function(ServiceProvider) {
            console.log('got here');
            $scope.service = ServiceProvider.get({
                serviceId: $stateParams.serviceId
            }, function() {
                $scope.reviews = $scope.service.reviews;
                var len = $scope.reviews.length;
                var total = 0;
                $scope.reviews.forEach(function(review) {
                    $http.get('review-ratings/user/' + review.UserId).success(function(response) {
                        review.totalRev = response.length;
                    }).error(function(response) {
                    });
                    total += review.value;
                });
                $scope.avg_rating += Math.round(total/len);
                var totalrating = parseInt($scope.service.no_of_rating_five) + parseInt($scope.service.no_of_rating_four) + parseInt($scope.service.no_of_rating_three) + parseInt($scope.service.no_of_rating_two) + parseInt($scope.service.no_of_rating_one);
                $scope.percentage_five =   (parseInt($scope.service.no_of_rating_five) / totalrating) * 100;
                $scope.percentage_four =   (parseInt($scope.service.no_of_rating_four) / totalrating) * 100;
                $scope.percentage_three =   (parseInt($scope.service.no_of_rating_three) / totalrating) * 100;
                $scope.percentage_two =   (parseInt($scope.service.no_of_rating_two) / totalrating) * 100;
                $scope.percentage_one =   (parseInt($scope.service.no_of_rating_one) / totalrating) * 100;
            });

        };


        $scope.createReview = function() {
            var review = new Reviews({
                service_id: $scope.service.id,
                value: $scope.rating,
                review: this.review,
                user_id: $scope.user.id
            });
            review.$save(function(response) {
                Message.success('Review','successfully added review');
                $scope.showReview = false;
                $location.path('services/' + $scope.service.id);
                $window.location.reload();
            }, function(errorResponse) {
                Message.error('Review', 'Something went wrong!');
            });
        };

        $scope.getTopReviews = function(ServiceProvider) {
            $scope.topReviews = [];
            $http.get('/service/top-reviews').success(function(response) {
                response.data.forEach(function(review) {
                    var res = ServiceProvider.get({
                        serviceId: review.service_id
                    }, function() {
                        review.img = res.images[0].url
                        $scope.topReviews.push(review);
                    });

                });

            }).error(function(response) {
                console.log(response);
            });
        };

        $scope.findReviews = function() {
            if(!isEmpty($scope.user)) {
                $scope.getTopReviews(Services)
                
            } else {
                $scope.getTopReviews(ServiceFac);
            }
        }

        $scope.getServiceByCategory = function(idx) {
          $scope.categoryArr = [];
          $http.get('/service/category/' + idx).success(function(response) {
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


        $scope.like = function(param) {
            Likes.like(param);
        }

        $scope.dislike = function(param) {
            Likes.dislike(param);
        }

    }
])
.directive('starkRating', function () {
    return {
        scope: {
            rating: '=',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&"
        },
        restrict: 'EA',
        template:
            "<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"/modules/core/img/star-empty-lg.png\" || \"/modules/core/img/star-fill-lg.png\"}}' \
                    ng-click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function ($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.rating;
            
            $scope.isolatedClick = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope.rating = $scope._rating = param;
                $scope.hoverValue = 0;
                $scope.click({
                    param: param
                });
            };

            $scope.isolatedMouseHover = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = 0;
                $scope.hoverValue = param;
                $scope.mouseHover({
                    param: param
                });
            };

            $scope.isolatedMouseLeave = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = $scope.rating;
                $scope.hoverValue = 0;
                $scope.mouseLeave({
                    param: param
                });
            };
        }
    };
});