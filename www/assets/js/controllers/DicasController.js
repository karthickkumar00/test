/* global angular, app */
app.controller('DicasController', function ($scope, $state, eresApi, eresData, $log, moment, $q,
        toastr, $timeout, $ionicPopup, $location, $rootScope, CONFIG, $cordovaNetwork) {

    $scope.data = {};
    $scope.data.userAvatar = eresData.getData("user-avatar");
    $scope.data.userName = eresData.getData("user-name");
    var page = 0;
    var postPerPage = CONFIG.post_per_page;
    var pageLimit = 1;
    $scope.data.pageData = [];
    
    var token = eresData.getData("x-auth-sb");

    /**
     * get all dicas from api and assigns it to scope
     */
    function getDicasAll() {
        page = ($scope.data.pageData.length / postPerPage) + 1;
        page = Math.ceil(page);
        
        var endpoint = "mobile/v1/dicas?posts_per_page=" + postPerPage + "&page=" + page;
        var config = {
            method: 'GET',
            headers: {
                'x-auth-sb': token
            }

        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {
                    
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast("scroll.refreshComplete");
                    $rootScope.$broadcast('loading:hide');
                    if (success.data.code !== "get_dicass_success") {
                        return false;
                    }
                    pageLimit = angular.copy(success.data.data.pages);
                    
                    if ($scope.data.pageData.length < postPerPage * page) {
                        $scope.data.pageData = $scope.data.pageData.concat(angular.copy(success.data.data.posts));
                        $timeout(function(){
                            
                            success = null;
                        });
                    }
                    eresData.updateData("dicas-posts", JSON.stringify($scope.data.pageData));
                        
                },
                function (error) {
                    
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $rootScope.$broadcast('loading:hide');
                    $scope.$broadcast("scroll.refreshComplete");
                }
        );

    }
    
    $scope.getDicasAll = getDicasAll;
    
    /**
     * The offline caching logic
     * If the app is online all data will be taken from api, if offline 
     * local storage is handled as fallback(if data exists) 
     * 
     */
    if($cordovaNetwork.isOnline()) {
        getDicasAll();
    } else {
        
        var postData = eresData.getData("dicas-posts");
        if(!postData){
            toastr.info("Não foi possível encontrar todos os dados salvos", 'Erro');
            return false;
        } else {
            
            $scope.data.pageData = JSON.parse(postData);
        }
        
    }


    /**
     * 
     * navigate function for single dicas page
     * 
     * @param {type} postId
     */

    $scope.navigate = function (postId) {

        $log.log("Trying to navigate");
        $location.path("/singlepopup/dicas/" + postId);

    };
    
    /**
     * Refresh the all ssma content
     */
    $rootScope.refreshAllDicas = function () {
        $timeout(function () {
            page = 0;
            pageLimit = 1;
            $scope.data.pageData = [];
            getDicasAll();
        });
        
    };

    $scope.moreDataCanBeLoaded = function () {
        
        if($cordovaNetwork.isOffline()) {
            
            return false;
        }
        if (page >= pageLimit) {

            return false;
        }
        return true;

    };

});