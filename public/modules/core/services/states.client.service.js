'use strict';

/**
*  Module
*
* Description
*/
angular.module('core').factory('StatesServ', ['$rootScope', function($rootScope){


    var getStates = function (){
        var prev = $rootScope.previousState;
        var curr = $rootScope.currentState;
        console.log($rootScope);
        $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            console.log('state service');
            prev = from.url;
            curr = to.url;
            console.log('Previous state:'+ prev);
            console.log('Current state:'+ curr);
        });
        
    };

    return {
        getStates: getStates
    };

}]);