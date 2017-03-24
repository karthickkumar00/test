/* global app */
app.controller('EditPhotoController', function ($scope, $state, eresApi, eresData, $rootScope, $stateParams, eresPopup, $log, toastr) {

    var token = eresData.getData("x-auth-sb");
    var postId = $stateParams.postId;
    $scope.data = {};
    var oldTitle;
    var oldSubTitle;
    var endpoint = "mobile/v1/photo/?id=" + postId;
    var config = {
        method: 'GET',
        headers: {
            'x-auth-sb': token

        }
    };

    eresApi.apiRequest(endpoint, config).then(
            function (success) {
                $rootScope.$broadcast('loading:hide');
                if (success.data.code !== "get_photo_success") {
                    $state.go("photos");
                    return false;
                }

                $scope.picture = success.data.data.thumbnail[0];
                $scope.data.title = success.data.data.title;
                oldTitle = $scope.data.title;
                $scope.data.subTitle = success.data.data.sub_title;
                oldSubTitle = $scope.data.subTitle;
            },
            function (error) {
                $rootScope.$broadcast('loading:hide');
            }
    );
    
    /**
     * For updating the photos title, called from scope
     * Update wont be triggered if title hasnt changed
     * 
     * @returns {Boolean}
     */
    
    $scope.updatePhoto = function () {

        if ($scope.data.title === oldTitle) {

            eresPopup.showAlert("Erro", "Nenhuma mudança detectada");
            return false;
        }

        var endpoint = "mobile/v1/photo/";
        var config = {
            method: 'POST',
            headers: {
                'x-auth-sb': token

            },
            data: {
                'post_id': postId,
                'title': $scope.data.title,
            }
        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {
                    $rootScope.$broadcast('loading:hide');
                    if (success.data.code !== "update_photo_success") {
                        $state.go("photos");
                        return false;
                    }
                    toastr.success("Sucesso");
                    $state.go("photos");
                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');
                }
        );

    };


});


