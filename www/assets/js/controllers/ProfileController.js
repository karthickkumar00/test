/* global app */
app.controller('ProfileController', function ($scope, $state, eresPopup, eresApi, eresData, $log, $ionicActionSheet
        ,eresLogin, toastr, $rootScope, $timeout) {
    $scope.myGoBack = function () {
        $state.go('dashboard');
    };
    $scope.data = {};
    var imageEncoded;
    $scope.picture = eresData.getData("user-avatar");
    var oldImage = $scope.picture;
    $scope.data.name = eresData.getData("user-name");
    $scope.data.age = eresData.getData("user-age");
    $scope.data.city = eresData.getData("home-town");
    $scope.data.telephone = eresData.getData("phone-number");
    $scope.data.email = eresData.getData("user-email");
    /**
     *  from scope, updtes profile
     *  data sent as FormData
     *  
     *  @returns {Boolean}
     */
    $scope.updateProfile = function () {

        if ($scope.picture !== oldImage) {
            $scope.data.file = $scope.picture;
        }
        if (!$scope.data.name) {

            eresPopup.showAlert("Erro", "Nomo empty");
            return false;
        }

        if (!$scope.data.age) {

            eresPopup.showAlert("Erro", "Idade vazia");
            return false;
        }

        if (!$scope.data.city) {

            eresPopup.showAlert("Erro", "Cidade vazia");
            return false;
        }

        if (!$scope.data.telephone) {

            eresPopup.showAlert("Erro", "Telefone vazia");
            return false;
        }

        if (!$scope.data.email) {

            eresPopup.showAlert("Erro", "Email vazia");
            return false;
        }

        var fileData = new FormData();
        fileData.append('user_name', $scope.data.name);
        fileData.append('user_age', $scope.data.age);
        fileData.append('home_town', $scope.data.city);
        fileData.append('phone_number', $scope.data.telephone);
        fileData.append('email', $scope.data.email);
        if ($scope.data.file) {

            var file = dataURItoBlob($scope.data.file);
            fileData.append('file', file, "photo.jpeg");
        }

        var token = eresData.getData("x-auth-sb");
        var endpoint = "mobile/v1/user/profile";
        var config = {
            method: 'POST',
            headers: {
                'x-auth-sb': token,
                "Content-type": undefined
            },
            data: fileData

        };
        eresApi.apiRequest(endpoint, config).then(
                function (success) {

                    $log.log(success);
                    eresLogin.getUserDetails(token).then(
                            function (userDataSuccess) {

                                $rootScope.$broadcast('loading:hide');
                                if (success.data.code !== "get_user_details_success") {

                                    eresData.updateData("user-avatar", userDataSuccess.data.data[1].avatar_url);
                                    eresData.updateData("user-name", userDataSuccess.data.data[1].user_name);
                                    eresData.updateData("user-age", userDataSuccess.data.data[1].user_age);
                                    eresData.updateData("user-id", userDataSuccess.data.data[0].ID);
                                    eresData.updateData("phone-number", userDataSuccess.data.data[1].phone_number);
                                    eresData.updateData("home-town", userDataSuccess.data.data[1].home_town);
                                    eresData.updateData("user-email", userDataSuccess.data.data[1].email);
                                    toastr.success('', 'Sucesso');
                                    if($rootScope.previousState === 'login'){
                                        $state.go('dashboard');
                                    }
                                }
                            },
                            function (error) {

                                toastr.error("Erro");
                            }
                    );
                },
                function (error) {

                    $rootScope.$broadcast('loading:hide');
                    toastr.error("Erro");
                }
        );
    };
    $scope.showActionsheet = function () {

        $ionicActionSheet.show({
            titleText: 'opções',
            buttons: [
                {text: '<i class="icon ion-camera"></i> Câmera'},
                {text: '<i class="icon ion-folder"></i> Galeria'}
            ],
            cancelText: 'Cancelar',
            cancel: function () {
                $log.log('CANCELLED');
            },
            buttonClicked: function (index) {
                if (index === 0) {
                    takePicture();
                    return true;
                }
                if (index === 1) {
                    getPicture();
                    return true;
                }
            }

        });
    };
    var takePicture = function () {

        var options = {
            quality: 100,
            targetWidth: 1920,
            targetHeight: 1080,
            sourceType: 1,
            correctOrientation :true,
            destinationType: Camera.DestinationType.DATA_URL
        };
        navigator.camera.getPicture(onSuccess, onFail, options);
        $rootScope.$broadcast('loading:show');
        function onSuccess(imageData) {

            var picture;
            var testImage = new Image();
            
            $timeout(function () {
                picture = "data:image/jpeg;base64," + imageData;
                testImage.src = picture;
                
            });
            
            
            
            testImage.onload = function () {
                $log.log(testImage.width + ", " + testImage.height);
                $log.log("natural", testImage.naturalWidth + ", " + testImage.naturalHeight);
                $rootScope.$broadcast('loading:hide');
                if(testImage.width >= 580 && testImage.height >= 580) {
                    
                    imageEncoded = imageData;
                    $scope.picture = testImage.src;
                    
                } else {
                    
                    toastr.error("A imagem não atender a resolução necessária", "Erro");
                }
            };
            
            
        }

        function onFail(message) {
            $rootScope.$broadcast('loading:hide');
            toastr.error("Ação cancelada", 'Erro');
        }
    };


    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type: mimeString});
    }

    var getPicture = function () {

        var options = {
            quality: 100,
            targetWidth: 1920,
            targetHeight: 1080,
            sourceType: 0,
            correctOrientation :true,
            destinationType: Camera.DestinationType.DATA_URL
        };
        $rootScope.$broadcast('loading:show');
        navigator.camera.getPicture(onSuccess, onFail, options);
        function onSuccess(imageData) {

            var picture;
            var testImage = new Image();
            
            $timeout(function () {
                picture = "data:image/jpeg;base64," + imageData;
                testImage.src = picture;
                
            });
            
            
            
            testImage.onload = function () {
                
                $rootScope.$broadcast('loading:hide');
                $log.log(testImage.width + ", " + testImage.height);
                $log.log("natural", testImage.naturalWidth + ", " + testImage.naturalHeight);
                
                if(testImage.width >= 580 && testImage.height >= 580) {
                    
                    imageEncoded = imageData;
                    $scope.picture = testImage.src;
                    
                } else {
                    
                    toastr.error("A imagem não atender a resolução necessária", "Erro");
                }
            };
            
            
        }

        function onFail(message) {
            toastr.error(message, 'Erro');
            $rootScope.$broadcast('loading:hide');
        }

    };
});
