/* global app */
app.controller('LoginController', function ($scope, $state, eresLogin, eresApi, $log, toastr, eresData, eresPopup, $location,
        $timeout, $rootScope, $cordovaNetwork, $ionicModal) {


    $scope.data = {};
    
    /**
     * Android and IOS the network information takes some time to set
     * we keep looping till the network information is set. We proceed after it.
     * 
     */
     function initializeApp(){
        if(
            typeof navigator.connection === "object" && 
            typeof navigator.connection.type === "string" && 
            typeof Connection === "object"
        ){
            checkOffline();
        } else {
            $timeout(function () {
                initializeApp();
            }, 100);
        }
        $scope.data = {};
    }
    initializeApp();
    
    function checkOffline(){
        if ($cordovaNetwork.isOffline()) {
            toastr.error("Este recurso não está disponível enquanto o aplicativo está offline", "Erro");
        }
    }
    

    /**
     * new login, vallidating user name password, grabbing details on success, if this is first login,
     * change password popup is shown
     * 
     * @param {type} login
     * @param {type} password
     * 
     * @returns {Boolean}
     * 
     */
    $scope.data.newLogin = function (login, password) {

        $log.info("trying to login");
        if (!login) {

            eresPopup.showAlert("Erro", "Usuário Invalido");
            return false;
        }
        if (!password) {

            eresPopup.showAlert("Erro", "senha vazia");
            return false;
        }
        eresData.deleteData("x-auth-sb");
        $rootScope.hideHeader = false;

        //cpf, password validation
        eresLogin.validateLogin(login, password).then(
                function (success) {
                    $log.log("success", success.data);
                    if (success.data.status !== true) {
                        toastr.error('Erro ao efetuar login, tente outra vez', 'Erro');
                        return false;
                    }

                    $log.info(success);

                    eresLogin.getUserDetails(success.data.token).then(
                            function (userDataSuccess) {

                                if (userDataSuccess.data.code !== "get_user_detail_success") {
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
                                eresData.updateData("x-auth-sb-temp", success.data.token);

                                var is_first_loggedin = userDataSuccess.data.data[1].is_first_loggedin;
                                //for testing change password module
//                                is_first_loggedin = false;
                                if (is_first_loggedin === "true") {
                                    toastr.success('', 'Bem-vindo!');
                                    //one signal id grabbing
                                    window.plugins.OneSignal.getIds(function (ids) {
                                        $scope.player_id = ids.userId;
                                        eresLogin.savePlayersData($scope.player_id).then(
                                                function (playerDataSuccess) {
                                                    $rootScope.$broadcast('loading:hide');
                                                    $log.log("Success!", playerDataSuccess);

                                                    var tokenTemp = eresData.getData('x-auth-sb-temp');
                                                    eresData.updateData('x-auth-sb', tokenTemp);
                                                    eresData.deleteData('x-auth-sb-temp');

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
                                                }
                                        );
                                    });
                                } else {
                                    $rootScope.$broadcast('loading:hide');
                                    eresData.updateData("user-login", login);
                                    $ionicModal.fromTemplateUrl('assets/templates/changepassword.html', {
                                        scope: $scope
                                    }).then(function (modal) {
                                        $scope.modal = modal;
                                        $scope.modal.show();
                                    });
                                }
                                $log.info(userDataSuccess);
                            },
                            function (error) {
                                $rootScope.$broadcast('loading:hide');
                            }
                    );


                },
                function (error) {

                    $rootScope.$broadcast('loading:hide');
                    $log.error("Couldn\'t log in");
                    toastr.error('Problemas com login, tente mais tarde ou chame o suporte', 'Erro');
                }
        );
    };
    /**
     * function called from change password popup, uses same logic as regular login to login after change in password
     * 
     * @returns {Boolean}
     */
    $scope.changePassword = function () {
        var token = eresData.getData('x-auth-sb-temp');
        if (!$scope.data.password) {
            eresPopup.showAlert("Erro", "senha vazia");
            return false;
        }
        if ($scope.data.password !== $scope.data.confirmPassword) {
            eresPopup.showAlert("Erro", "Senha incorreta");
            return false;
        }
        $rootScope.hideHeader = false;
        var functionName = "changePassword";
        $log.log("at " + functionName);
        var endpoint = "mobile/v1/user/password";
        var data = {
            "change_password": $scope.data.password,
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
                    var functionName = "logOut";
                    $log.log(functionName + ": logging out, redirecting to login page");
                    eresData.deleteData('home-town');
                    eresData.deleteData('phone-number');
                    eresData.deleteData('user-age');
                    eresData.deleteData('user-avatar');
                    eresData.deleteData('user-email');
                    eresData.deleteData('user-id');
                    eresData.deleteData('user-name');
                    eresData.deleteData('x-auth-sb-temp');
                    eresData.deleteData('x-auth-sb');
                    $scope.login = '';
                    $scope.password = '';


                    var login = eresData.getData("user-login");
                    eresLogin.validateLogin(login, $scope.data.password).then(
                            function (success) {
                                $log.log("success", success.data);
                                if (success.data.status !== true) {
                                    toastr.error('Erro ao efetuar login, tente outra vez', 'Erro');
                                    return false;
                                }

                                $log.info(success);

                                eresLogin.getUserDetails(success.data.token).then(
                                        function (userDataSuccess) {

                                            if (userDataSuccess.data.code !== "get_user_detail_success") {
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
                                            eresData.updateData("x-auth-sb", success.data.token);
                                            document.cookie = "cc_data=" + userDataSuccess.data.data[0].ID + "; path=/";

                                            toastr.success('', 'Bem-vindo!');
                                            window.plugins.OneSignal.getIds(function (ids) {
                                                $scope.player_id = ids.userId;
                                                eresLogin.savePlayersData($scope.player_id).then(
                                                        function (playerDataSuccess) {

                                                            $rootScope.$broadcast('loading:hide');
                                                            $log.log("success", playerDataSuccess);
                                                            $scope.modal.hide();
                                                            $state.go('profile');
                                                        },
                                                        function (error) {

                                                            $scope.modal.hide();
                                                            $rootScope.$broadcast('loading:hide');
                                                            $state.go('profile');
                                                        }
                                                );
                                            });

                                            $log.info(userDataSuccess);
                                        },
                                        function (error) {

                                            $rootScope.$broadcast('loading:hide');

                                        }
                                );


                            },
                            function (error) {

                                $rootScope.$broadcast('loading:hide');
                                $log.error("Couldn\'t log in");
                                toastr.error('Problemas com login, tente mais tarde ou chame o suporte', 'Erro');
                            }
                    );


                },
                function (error) {

                    $rootScope.$broadcast('loading:hide');
                    $log.error("Couldn\'t log in");
                }
        );
    };

    $scope.changeFocus = function () {

        $log.log("trying to change focus");
        var element = document.getElementById("password");

//        document.body.scrollTop
        if (element)
            element.focus();

    };
    $scope.changeFocusPassword = function () {

        $log.log("trying to change focus");
        var element = document.getElementById("confirm-password");

//        document.body.scrollTop
        if (element)
            element.focus();

    };


});