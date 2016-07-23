'use strict';

//Services service used for communicating with the services REST endpoints
angular.module('services').factory('Likes', ['$http', 'Message',
    function($http, Message) {
        
        var like = function(params) {
            params.l_type = "like";
            params.review_id = params.id;
            $http.post('api/review-ratings/like', params).success(function(response) {
                console.log(response);
                Message.success(response.message);
            }).error(function(response) {
                Message.error(response.message);
            });
        };

        var dislike = function(params) {
            params.l_type = "dislike";
            params.review_id = params.id;
            $http.post('api/review-ratings/dislike', params).success(function(response) {
                console.log(response);
                Message.success(response.message);
            }).error(function(response) {
                Message.error(response.message);
            });
        };

        return {
            like: like,
            dislike: dislike
        }
    }
]);
