'use strict';

angular.module('core').factory('Search', ['$q', '$location', 'esFactory',
    function($q, $location, elasticsearch) {
        var client = elasticsearch({
            host: $location.host() + ':9200'
        });

        var search = function(term, offset) {
            var deferred = $q.defer();
            var query = {
                match: {
                    _all: term
                }
            };

            client.search({
                index: 'raytee',
                type: 'services',
                body: {
                    size: 10,
                    from: (offset || 0) * 10,
                    query: query
                }
            }).then(function(result) {
                var ii = 0,
                    hits_in, hits_out = [];

                hits_in = (result.hits || {}).hits || [];

                for (; ii < hits_in.length; ii++) {
                    hits_out.push(hits_in[ii]._source);
                }

                deferred.resolve(hits_out);
            }, deferred.reject);

            return deferred.promise;
        };

        return {
            search: search
        };
    }
]);