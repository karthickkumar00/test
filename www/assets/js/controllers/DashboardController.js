/*global angular, app, cordova, device*/
app.controller('DashboardController', function ($scope, $log, eresLogin, $rootScope, eresData, eresApi, $interval, $state, $ionicHistory,
        $cordovaNetwork, toastr) {


    $scope.userLogout = eresLogin.logOut;
    $rootScope.$broadcast('loading:hide');
    $rootScope.redirect_url = window.location.href;

    /**
     * we are getting the apps settings from local and will be deciding what all menus to display based on that
     */
    $scope.data = {};
    $scope.data.settings = {};

    var allSettings = JSON.parse(eresData.getData("settings"));
    var dashboardSettings = allSettings.dashboard_page_settings;
    angular.forEach(dashboardSettings, function (dashboardSetting, key) {

        $scope.data.settings[dashboardSetting] = true;
    });



    if (cordova) {
        cordova.plugins.Keyboard.close();
    }
    
    /**
     * 
     * Here we are checking the device and if it is android we are using
     * permission plugin which supports only android, The write permission for
     * the platform has been checked and this will be used for saving images from
     * comet chat.
     */
    
    if (device) {
        var devicePlatform = device.platform;
        $log.log(device.platform);
        if (device.platform === "Android") {

            var permissions = cordova.plugins.permissions;
            permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, checkPermissionCallback, null);
        }
    }

    /**
     * Permission call back function
     * 
     * @param {type} status
     * 
     */
    function checkPermissionCallback(status) {
        if (!status.hasPermission) {
            var errorCallback = function () {
                $log.warn('Camera permission is not turned on');
            }

            permissions.requestPermission(
                    permissions.WRITE_EXTERNAL_STORAGE,
                    function (status) {
                        if (!status.hasPermission)
                            errorCallback();
                    },
                    errorCallback);
        }
    }

    /**
     * 
     * Getting the badge value for conversation
     */
    function callbadgeCount() {
        $rootScope.$broadcast('loading:hide');
        var token = eresData.getData("x-auth-sb");
        var endpoint = 'mobile/v1/chat/auth?receive=true&token=' + token;

        var config = {
            method: 'GET'
        };

        eresApi.apiRequest(endpoint, config, true).then(
                function (success) {
                    $rootScope.badgeCount = success.data.data.message_count;


                },
                function (error) {

                    $rootScope.$broadcast('loading:hide');
                }
        );
    }
//    if ($cordovaNetwork.isOnline()) {
//
//        callbadgeCount();
//        if (!$rootScope.badgeInterval) {
//
//            $log.log("creating a new interval");
//            $rootScope.badgeInterval = $interval(function () {
//
//                $log.log("checking current state for calling ", $state.current.name);
//                if ($state.current.name === "dashboard" || $state.current.name === "conversation") {
//                    callbadgeCount();
//                }
//            }, 10000);
//        }
//    }

    /**
     * function to update the badge, calling the badge count api call binding function evey 10 seconds
     */

     /**
      * Navigation function for dashboard entries, all navigation is allowed when
      * the app is online, however if app is offline only dicas, ssma, recados and 
      * event redirections will be permitted
      * 
      * @param {type} stateName
      * 
      */
    $scope.navigateMain = function (stateName) {

        if ($cordovaNetwork.isOnline()) {

            $state.go(stateName);
        } else {

            if (stateName === 'dicas' || stateName === 'ssma' || stateName === 'events' || stateName === 'recados') {

                $state.go(stateName);
            } else {

                toastr.error("Este recurso não está disponível enquanto o aplicativo está offline", "Erro");
            }

        }
    };



});