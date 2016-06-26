'use strict';

// Setting up route
angular.module('review-ratings').config(['$stateProvider',
  function($stateProvider) {
    // Articles state routing
        var access = roleManager.accessLevels;
    $stateProvider.
    state('listReviewRatings', {
      url: '/review-ratings',
      templateUrl: 'modules/review-ratings/views/list-review-ratings.client.view.html',
                data : {
                    access : access.anon
                }
    }).
    state('createReviewRating', {
      url: '/review-ratings/create',
      templateUrl: 'modules/review-ratings/views/create-review-rating.client.view.html',
                data : {
                    access : access.user
                }
    }).
    state('viewArticle', {
      url: '/review-ratings/:review-ratingId',
      templateUrl: 'modules/review-ratings/views/view-review-rating.client.view.html',
                data : {
                    access : access.user
                }
    }).
    state('editArticle', {
      url: '/review-ratings/:review-ratingId/edit',
      templateUrl: 'modules/review-ratings/views/edit-review-rating.client.view.html',
                data : {
                    access : access.user
                }
    });
  }
]);
