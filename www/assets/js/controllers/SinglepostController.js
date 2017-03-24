app.controller('SinglepostController', function ($scope, $state, eresPopup, eresData, eresApi,
        $log, $ionicActionSheet, $timeout, $rootScope, toastr) {

    $scope.data = {};
    var imageEncoded;

    /**
     * function to get the current cover page
     */
    function getCurrentCover() {

        var endpoint = "mobile/v1/user/cover";
        var token = eresData.getData("x-auth-sb");

        var config = {
            headers: {
                'x-auth-sb': token
            },
            method: 'GET'
        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {

                    $rootScope.$broadcast('loading:hide');
                    if (success.data.code !== "get_user_cover_success") {

                        return false;
                    }

                    $timeout(function () {

                        $scope.picture = success.data.data.user_cover_url;
                    });


                },
                function (error) {

                    $rootScope.$broadcast('loading:hide');
                }
        );
    }

    getCurrentCover();


    /**
     *  function to save a new cover photo, called from scope
     * 
     * @returns {Boolean}
     */
    $scope.newPost = function () {

        var token = eresData.getData("x-auth-sb");
        $scope.data.file = dataURItoBlob($scope.picture);

        $log.log("file", $scope.data.file);
        if (!$scope.data.file) {
            eresPopup.showAlert("Erro", "Escolha uma foto");
            return false;
        }


        var fileData = new FormData();
        fileData.append('file', $scope.data.file, "photo.jpeg");

        $log.log(fileData);
        var endpoint = "mobile/v1/user/cover";
        var config = {
            headers: {
                'x-auth-sb': token,
                'Content-type': undefined
            },
            data:
                    fileData,
            method: 'POST'
        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {

                    $rootScope.$broadcast('loading:hide');
                    toastr.success("FOTO ENVIADA COM SUCESSO");
                    $log.info(success);
                },
                function (error) {

                    $rootScope.$broadcast('loading:hide');
                    $log.info(error);
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
                $log.log(testImage.width + ", " + testImage.height);
                $log.log("natural", testImage.naturalWidth + ", " + testImage.naturalHeight);
                
                $rootScope.$broadcast('loading:hide');
                if (testImage.width >= 1200 && testImage.height >= 1200) {

                    imageEncoded = imageData;
                    $scope.picture = testImage.src;

                } else {

                    toastr.error("A imagem não atender a resolução necessária", "Erro");
                }
            };


        }

        function onFail(message) {
            $rootScope.$broadcast('loading:hide');
            toastr.error(message, '');
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
                $log.log(testImage.width + ", " + testImage.height);
                $log.log("natural", testImage.naturalWidth + ", " + testImage.naturalHeight);
                $rootScope.$broadcast('loading:hide');
                
                if (testImage.width >= 1200 && testImage.height >= 1200) {

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

});

