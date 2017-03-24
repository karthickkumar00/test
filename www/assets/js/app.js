/* global angular */

// ngcordova
var app = angular.module('eresApp', ['ionic', 'ui.router', 'ngAnimate', 'toastr', 'angularMoment', 'ngCordova', 'ionicLazyLoad']);

app.constant('$ionicLoadingConfig', {
    template: '<ion-spinner icon="spinner-energized"></ion-spinner>'
});
app.run(function ($state, $rootScope) {
    $rootScope.$state = $state;
});

app.run(function ($ionicPlatform, $rootScope, $ionicLoading, $state, $timeout, $log, CONFIG, toastr, $ionicHistory,
        eresApi, eresData, $cordovaNetwork) {


    if (CONFIG.debugger_mode === false) {

        console.log("%cSuperbotics", "color:orange;font-size: 16pt");
        $log.log = function () {
        };
        $log.info = function () {
        };
        $log.error = function () {
        };
        $log.debug = function () {
        };
        $log.warn = function () {
        };

    }


    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {


        /**
         * The following logic is implemeted to add an offline flag for the 
         * whole app, The flag will be set at device ready and at further app 
         * coming offline and online events
         * 
         */
        //$rootScope.offlineFlag = $cordovaNetwork.isOffline();

        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            $timeout(function(){
                $rootScope.offlineFlag = false;
                toastr.info("App veio em linha", '');
                
            });
        });

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            $timeout(function(){
                $rootScope.offlineFlag = true;
                toastr.warning("App ficou offline", '');
                
            });
        });


        /**
         * Since ios safari doesnt't allow direct downloads from webview. So we
         * are posting the download url from the iframe using window.postMessage
         * That message is recieved and handled here
         * In android it opens in a new window and is downaloaded automatically
         * In ios it is opened in system browser, the user can download it from
         * there by long press and clicking save
         * 
         */
        window.addEventListener('message', function (event) {
            $log.log("event triggered from iframe cached ", event);
            $log.log(device.platform);
            var downloadUrl = event.origin + "/cometchat-dev/" + event.data;

            if (device.platform === "Android") {

                window.location.assign(downloadUrl)

            }
            if (device.platform === "iOS") {

                downloadUrl = downloadUrl + encodeURIComponent("&type=ios");
                window.open(downloadUrl, "_system", {closebuttoncaption: "Close"});

            }
        });

        window.addEventListener("native.keyboardshow", keyboardShowHandler, false);
        window.addEventListener("native.keyboardhide", keyboardHideHandler, false);

        document.addEventListener("backbutton", function (e) {

            $timeout(function () {

                e.preventDefault();
            });

            $log.log('back button triggered', $state.current);
            $log.log("e function ", e.preventDefault);
            if ($state.current.name === 'dashboard' || $state.current.name === 'login') {

                navigator.app.exitApp();
            } else
            if ($state.current.name === 'profile' || $state.current.name === 'ssma' || $state.current.name === 'dicas' ||
                    $state.current.name === 'events' || $state.current.name === 'profile' || $state.current.name === 'profile') {

                $timeout(function () {

                    $state.go("dashboard");
                });


            } else {
                navigator.app.backHistory()
            }
        }, false);


        $rootScope.$ionicGoBack = function (backCount) {

            if ($state.current.name === 'profile' || $state.current.name === 'ssma' || $state.current.name === 'dicas' ||
                    $state.current.name === 'events' || $state.current.name === 'profile' || $state.current.name === 'profile') {

                $timeout(function () {

                    $state.go("dashboard");
                });


            } else {

//                navigator.app.backHistory()
                $ionicHistory.goBack();
            }
        };

         /**
          * Function to handle external links. This funciton will handle all 
          * anchor tag cliicks with href having a http:// or https:// prefix and
          * opens them using the system browser.
          * Logic implemented to handle the third party links in dicas and ssma
          * 
          */

        function handleHowExternalLinksOpen() {
            document.onclick = function (e) {
                e = e || window.event;
                var element = e.target || e.srcElement;
                var parentElements = document.getElementsByClassName('pane');
                for (var x = 0; x < parentElements.length; x++) {
                    var parentElement = parentElements[x];

                    if (element.tagName === 'A' && parentElement.contains(element)) {
                        if (element.href.indexOf('http://') === 0 || element.href.indexOf('https://') === 0) {

                            $log.info('Link is not internal. Opening in system browser.', element.href);
                            window.open(element.href, "_system", "location=yes");
                        }
                        return false;

                    }
                }
            }
        }
        handleHowExternalLinksOpen();


    }

    var keyboardShowHandler = function (e) {

        if ($state.current.name === "login") {
            $timeout(function () {
                var loginLogo = document.getElementById("login-la-logo");
                if (loginLogo) {

                    loginLogo.style.display = "none";
                }

                var passwordLogo = document.getElementById("password-la-logo");
                if (passwordLogo) {

                    passwordLogo.style.display = "none";
                }
                $rootScope.hideHeader = true;
            });

        }

    };

    var keyboardHideHandler = function (e) {

        if ($state.current.name === "login") {
            $timeout(function () {
                var loginLogo = document.getElementById("login-la-logo");
                if (loginLogo) {

                    loginLogo.style.display = "block";
                }

                var passwordLogo = document.getElementById("password-la-logo");
                if (passwordLogo) {

                    passwordLogo.style.display = "block";
                }
                $rootScope.hideHeader = false;
            });

        }
    };

    $ionicPlatform.ready(function () {

        $rootScope.$broadcast('loading:hide');
        var endpoint = 'mobile/v1/settings';

        var config = {
            method: 'GET',
        };
        eresApi.apiRequest(endpoint, config, true).then(
                function (success) {

                    $log.info("success", success);
                    eresData.updateData("settings", JSON.stringify(success.data));

                    initializeOneSingal(success.data.app_key, success.data.google_project_number);
                },
                function (error) {


                }
        );


        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            if(!ionic.Platform.isIOS()){
                cordova.plugins.Keyboard.disableScroll(true);
            }
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        window.open = cordova.InAppBrowser.open;

    });

    /**
     *Initialising one signal here, this function is callled after fetching data
     *using the settings api
     *  
     * @param {type} appId
     * @param {type} googleProjectNumber
     * 
     */
    function initializeOneSingal(appId, googleProjectNumber) {
        
        /**
         * Function to handle notification open event. This function will be 
         * called even if app is offline. This will save the push daat type to 
         * handle the redirection, which is handled in logincontroller, If the 
         * app islive a toastr will be displayed aswell
         * 
         * @param {type} jsonData
         * 
         */
        var notificationOpenedCallback = function (jsonData) {
            $timeout(function () {
                if (jsonData.additionalData.type) {
                    localStorage.setItem("push-type", jsonData.additionalData.type);

                } else if (jsonData.additionalData[0].type) {
                    localStorage.setItem("push-type", jsonData.additionalData[0].type);
                }

                toastr.info(jsonData.message, '', {timeOut: 0, extendedTimeOut: 0});
            });

        };

        window.plugins.OneSignal.init(appId,
                {googleProjectNumber: googleProjectNumber},
        notificationOpenedCallback);

        // Show an alert box if a notification comes in when the user is in your app.
        window.plugins.OneSignal.enableInAppAlertNotification(false);

    }


    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({
            template: '<ion-spinner class="spinner-assertive"></ion-spinner>',
            //Will a dark overlay or backdrop cover the entire view
            showBackdrop: true,
            // The delay in showing the indicator
            showDelay: 1,
        });
    });
    $rootScope.$on('loading:hide', function () {
        $timeout(function () {
            $ionicLoading.hide();
        });
    });
    $rootScope.previousState;
    $rootScope.currentState;
    $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;

    });

});

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('splashscreen');
    $stateProvider
            .state('splashscreen', {
                url: '/splashscreen',
                templateUrl: 'assets/templates/splashscreen.html',
                controller: 'SplashscreenController'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'assets/templates/login.html',
                controller: 'LoginController'
            })
            .state('changepassword', {
                url: '/changepassword',
                templateUrl: 'assets/templates/changepassword.html',
                controller: 'LoginController'
            })
            .state('forgetpassword', {
                url: '/forgetpassword',
                templateUrl: 'assets/templates/forgetpassword.html',
                controller: 'ForgetPasswordController'
            })
            .state('dashboard', {
                url: '/dashboard',
                cache: false,
                templateUrl: 'assets/templates/dashboard.html',
                controller: 'DashboardController'
            })
            .state('events', {
                url: '/events',
                cache: false,
                templateUrl: 'assets/templates/events.html',
                controller: 'EventController'
            })
            .state('photos', {
                url: '/photos',
                cache: false,
                templateUrl: 'assets/templates/photos.html',
                controller: 'PhotosController'
            })
            .state('radioschedule', {
                url: '/radioschedule',
                cache: false,
                templateUrl: 'assets/templates/radioschedule.html',
                controller: 'RadioScheduleController'
            })
            .state('recados', {
                url: '/recados',
                cache: false,
                templateUrl: 'assets/templates/recados.html',
                controller: 'RecadosController'
            })
            .state('ssma', {
                url: '/ssma',
                cache: false,
                templateUrl: 'assets/templates/ssma.html',
                controller: 'SsmaController'
            })

            .state('dicas', {
                url: '/dicas',
                cache: false,
                templateUrl: 'assets/templates/dicas.html',
                controller: 'DicasController'
            })
            .state('polls', {
                url: '/polls',
                templateUrl: 'assets/templates/polls.html',
                controller: 'PollsController'
            })
            .state('singlepost', {
                url: '/singlepost',
                templateUrl: 'assets/templates/singlepost.html',
                controller: 'SinglepostController'
            })
            .state('profile', {
                url: '/profile',
                templateUrl: 'assets/templates/profile.html',
                controller: 'ProfileController'
            })
            .state('singlepopup', {
                url: '/singlepopup/:postType/:postId',
                templateUrl: 'assets/templates/singlepopup.html',
                controller: 'SinglepopupController'
            })
            .state('editphoto', {
                url: '/editphoto/:postId',
                templateUrl: 'assets/templates/edit-photo.html',
                controller: 'EditPhotoController'
            })
            .state('addphoto', {
                url: '/addphoto',
                templateUrl: 'assets/templates/add-photo.html',
                controller: 'AddPhotoController'
            })
            .state('singlephoto', {
                url: '/photo/:postId',
                templateUrl: 'assets/templates/singlephoto.html',
                controller: 'SinglePhotoController'
            })
            .state('singlerecados', {
                url: '/recados/:postId',
                templateUrl: 'assets/templates/single-recados.html',
                controller: 'SingleRecadosController'
            })
            ;


});