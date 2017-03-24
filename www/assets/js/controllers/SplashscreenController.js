/* global app */
app.controller('SplashscreenController', function ($scope, $state, eresLogin, eresApi, $log, toastr, eresData, eresPopup, $location,
        $timeout, $rootScope, $cordovaNetwork, $interval) {


    /**
     * Android and IOS the network information takes some time to set
     * we keep looping till the network information is set. We proceed after it.
     * 
     */
    function initializeApp() {
        if (
                typeof navigator.connection === "object" &&
                typeof navigator.connection.type === "string" &&
                typeof Connection === "object"
                ) {
            init();
        } else {
            $timeout(function () {
                initializeApp();
            }, 100);
        }
        $scope.data = {};
    }
    initializeApp();

    function init() {
        //fetching token for previous logins
        var token = eresData.getData('x-auth-sb');
        /**
         * taking token, and getting user details to validate token,
         */
        if (!token) {
            $rootScope.$broadcast('loading:hide');
            $state.go("login");
        } else if ($cordovaNetwork.isOffline() && token) {

            $timeout(function () {
                toastr.warning("App é desligada, as funcionalidades são limitadas", '');
                $state.go("dashboard");

            });

        }
        else {
            $timeout(function () {

                $rootScope.$broadcast('loading:show');
            });
            eresLogin.getUserDetails(token).then(
                    function (userDataSuccess) {
                        $rootScope.$broadcast('loading:hide');
                        if (userDataSuccess.data.code !== "get_user_detail_success") {
                            $timeout(function () {
                                eresData.deleteData("x-auth-sb");
                                $state.go("login")
                            });
                            return false;
                        }
                        var userImage = userDataSuccess.data.data[1].avatar_url;
                        if (!userImage) {
                            userImage = "assets/img/default.png"
                        }
                        eresData.updateData("user-avatar", userImage);
                        eresData.updateData("user-name", userDataSuccess.data.data[1].user_name);
                        eresData.updateData("user-age", userDataSuccess.data.data[1].user_age);
                        eresData.updateData("user-id", userDataSuccess.data.data[0].ID);
                        eresData.updateData("phone-number", userDataSuccess.data.data[1].phone_number);
                        eresData.updateData("home-town", userDataSuccess.data.data[1].home_town);
                        eresData.updateData("user-email", userDataSuccess.data.data[1].email);

                        $rootScope.$broadcast('loading:hide');
                        var pushType = eresData.getData("push-type");
                        if (!pushType) {
                            $location.path('/dashboard');
                        } else if (pushType === 'event') {
                            $state.go("events");
                            eresData.deleteData("push-type");
                        } else if (pushType === 'dicas') {
                            $state.go("dicas");
                            eresData.deleteData("push-type");
                        } else if (pushType === 'recados') {
                            $state.go("recados");
                            eresData.deleteData("push-type");
                        }
                        else if (pushType === 'ssma') {
                            $state.go("ssma");
                            eresData.deleteData("push-type");
                        } else {
                            $state.go("dashboard");
                            eresData.deleteData("push-type");
                        }
                    },
                    function (error) {
                        $rootScope.$broadcast('loading:hide');
                        eresData.deleteData("x-auth-sb");
                        $state.go("login");
                        $rootScope.$broadcast('loading:hide');

                    }
            );
        }
    }

});
