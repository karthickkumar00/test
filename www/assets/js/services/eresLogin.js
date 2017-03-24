app.factory('eresLogin', function ($state, $q, $log, $location, eresApi, eresData, $ionicHistory, $log, $timeout) {
    
    /**
     * Function to validate the cpf and password.
     * 
     * @param {type} email
     * @param {type} password
     * 
     * @returns {$q@call;defer.promise}
     */
    function validateLogin(email, password) {
        var functionName = "validateLogin";
        $log.log("at " + functionName);
        var endpoint = "app/v1/login/";
        var deferred = $q.defer();

        var data = {
            "user": email,
            "password": password

        };

        var config = {
            data: data,
            method: 'POST'
        };
        eresApi.apiRequest(endpoint, config).then(
                function (success) {

                    deferred.resolve(success);
                },
                function (error) {

                    deferred.reject(error);
                }
        );
        return deferred.promise;
    }
    /**
     * Grabs and all user data and returns it
     * 
     * @param {type} token
     * 
     * @returns {$q@call;defer.promise}
     */
    function getUserDetails(token) {
        var functionName = "getUserDetails";
        $log.log("at " + functionName);
        var endpoint = "mobile/v1/user/detail";
        var deferred = $q.defer();



        var config = {
            method: 'GET',
            headers: {
                'x-auth-sb': token
            }
        };
        eresApi.apiRequest(endpoint, config).then(
                function (success) {

                    deferred.resolve(success);
                },
                function (error) {

                    deferred.reject(error);
                }
        );
        return deferred.promise;
    }

    /**
     * Save one signal player_key
     * 
     * @param {type} player_key
     * 
     * @returns {$q@call;defer.promise}
     */
    function savePlayersData(player_key) {
        var token = eresData.getData('x-auth-sb');
        if(!token){
            token = eresData.getData('x-auth-sb-temp');
        }
		
        var functionName = "onesignalplayers";
        $log.log("at " + functionName);
        var endpoint = "mobile/v1/push/register/";
        var deferred = $q.defer();

        var data = {
            "player_key": player_key,
        };

        var config = {
            data: data,
            method: 'POST',
            headers: {
                'x-auth-sb': token
            }
        };
        eresApi.apiRequest(endpoint, config).then(
                function (success) {

                    deferred.resolve(success);
                },
                function (error) {

                    deferred.reject(error);
                }
        );
        return deferred.promise;
    }
    /**
     * Logout function thats is to be called in all required instances, removes
     * all user local data, except settings and will redirect to login page
     * 
     */
    function logOut() {
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
        eresData.deleteData('x-auth-sb-temp');
        eresData.deleteData('events-posts');
        eresData.deleteData('ssma-posts');
        eresData.deleteData('recados-posts');
        eresData.deleteData('dicas-posts');
        
        
        $timeout(function () {
         $ionicHistory.clearCache();
         $ionicHistory.clearHistory();
         $log.debug('clearing cache')
     },300)
        $location.path("login");
        
        
    }

    return {
        logOut: logOut,
        validateLogin: validateLogin,
        getUserDetails: getUserDetails,
        savePlayersData: savePlayersData
    };


});