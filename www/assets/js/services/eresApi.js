/* global angular */

(function () {
    var eresApi = function ($http, $log, $q, $rootScope, eresData, $state, CONFIG, $timeout, $location, $ionicHistory, toastr) {

        var apiBaseUrl = CONFIG.site_url;
        var apiOnesignalUrl = CONFIG.one_signal_url;
        
        /**
         * Basic binder for all api calls
         * 
         * @param {type} endpoint
         * @param {type} args
         * @param {type} hideLoader
         * 
         * @returns {$q@call;defer.promise}
         * 
         */
        function apiRequest(endpoint, args, hideLoader) {

            if ($rootScope.offlineFlag === true && !hideLoader) {
                $timeout(function () {

                    toastr.error("Não é possível chamar api", 'Erro');
                    return false;
                });

            }
            var functionName = "apiRequest";
            if (!hideLoader) {
                $rootScope.$broadcast('loading:show');
            }

            $log.info(functionName + ": started", endpoint);

            var deferred = $q.defer();

            $log.info(functionName + ": about to make request to: " + apiBaseUrl + endpoint);


            var config = {
                method: 'GET',
                url: apiBaseUrl + endpoint,
            };

            angular.extend(config, args);
            $log.info(config);

            // $http.post(apiBaseUrl + endpoint, data)

            $http(config)
                    .then(function (success) {
                        $log.info(functionName + ": success", endpoint, success);
                        deferred.resolve(success);
                    }, function (error) {
                        $log.error(functionName + ": failed", endpoint, error);
//                        apiRequestFail(error);
                        deferred.reject(error);
                    });

            return deferred.promise;
        }
        function apiGlobalRequest(url){
            var functionName = "apiRadioSchedule";
            
            var deferred = $q.defer;
            
            var config = {
                method: 'GET',
                url:url
            }
            $http(config).then(function(success){
                $log.info(functionName + ": success", endpoint, success);
              deferred.resolve(success);  
            },function(error){
                $log.info(functionName + ": success", endpoint, success);
                deferred.reject(error);
            })
        }
       
        /**
         * Function is callled from apiRequest functions failure fallback,
         * handling forbidden response and deletes user data and redirects to
         * login page
         * 
         * @param {type} error
         * 
         */
        function apiRequestFail(error) {
            if(!error.data){
                
                return false;
            }
            if(error.data){
                
                if(error.data.status !== 403) {
                    return false;
                }
            }
            if (error.data.status === 403 && error.data.message === 'Sem permissão para fazer isso.')
            {
                var functionName = "logOut";
                $log.log(functionName + ": logging out, redirecting to login page");
                eresData.deleteData('home-town');
                eresData.deleteData('phone-number');
                eresData.deleteData('user-age');
                eresData.deleteData('user-avatar');
                eresData.deleteData('user-email');
                eresData.deleteData('user-id');
                eresData.deleteData('user-name');
                eresData.deleteData('x-auth-sb');
                eresData.deleteData('push-type');
                eresData.deleteData('x-auth-sb-temp');
                eresData.deleteData('events-posts');
                eresData.deleteData('ssma-posts');
                eresData.deleteData('recados-posts');
                eresData.deleteData('dicas-posts');

                $timeout(function () {
                           $ionicHistory.clearCache();
                             $ionicHistory.clearHistory();
                             $log.debug('clearing cache')
                     }, 300);
                
                $state.go('login', {}, {reload: true});
                toastr.error('Sem permissão para fazer isso', 'Erro');
            }
            return true;
        }

        return {
            apiRequest: apiRequest,
            apiRequestFail: apiRequestFail,
        };
    };

    var module = angular.module("eresApp");
    module.factory("eresApi", eresApi);

}());