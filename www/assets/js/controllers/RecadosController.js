app.controller('RecadosController', function ($scope, $rootScope, $state, eresApi, eresData, $log, $q, toastr,
        $timeout, $location, $filter, CONFIG, $cordovaNetwork) {
    $scope.myGoBack = function () {
        $state.go('dashboard');
    };

    var page = 0;
    var postPerPage = CONFIG.post_per_page;
    var pageLimit = 1;
    $scope.recados = [];
    
    

    /**
     * getting all alerts from api and saving in scope
     * has pull to refresh option from scope, so function should be binded to scope
     * convert date format using moment js for recdos
     */
    var getRecados = function () {

        page = ($scope.recados.length / postPerPage) + 1;
        page = Math.ceil(page);
        
        var endpoint = "mobile/v1/recados?posts_per_page=" + postPerPage + "&page=" + page;
        var token = eresData.getData("x-auth-sb");
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
                    if (success.data.code !== "get_recadoss_success") {

                        return false;
                    }
                    pageLimit = angular.copy(success.data.data.pages);

                    if ($scope.recados.length < postPerPage * page) {
                        $scope.recados = $scope.recados.concat(angular.copy(success.data.data.posts));
                        $timeout(function () {

                            success = null;
                        });
                    }
                    angular.forEach($scope.recados, function (recado, key) {
                        var splitDate = recado.date.split(' ');
                        var splitMonth = splitDate[0];
                        var DateObj = splitDate[1].split(',');
                        var Date = DateObj[0];
                        var year = splitDate[2];
                        var month = moment().month(splitMonth).format("MM");
                        recado.dateFormatted = Date + '/' + month + '/' + year;
                        //recado.date = moment(formatDate).format('l');
                    })

                    $log.log("recados ", $scope.recados);
                    eresData.updateData("recados-posts", JSON.stringify($scope.recados));
                    if (!$scope.recados.length) {

                        toastr.warning('Não há recados para este de usuário', 'Atenção');

                    }


                }
        ,
                function (error) {

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $rootScope.$broadcast('loading:hide');
                    $scope.$broadcast("scroll.refreshComplete");
                }
        );

    }
    $scope.getRecados = getRecados;
    
    /**
     * The offline caching logic
     * If the app is online all data will be taken from api, if offline 
     * local storage is handled as fallback(if data exists) 
     * 
     */
    if($cordovaNetwork.isOnline()) {
        getRecados();
    } else {
        
        var postData = eresData.getData("recados-posts");
        if(!postData){
            toastr.info("Não foi possível encontrar todos os dados salvos", 'Erro');
            return false;
        } else {
            
            $scope.recados = JSON.parse(postData);
        }
        
    }


    /**
     * navigation page to single recados page
     * 
     * @param {type} id
     */
    $scope.navigate = function (id) {
        if(id !== undefined){
            $location.path("recados/" + id);
        }       

    };


    /**
     * Refresh the all ssma content
     */
    $rootScope.refreshAllRecados = function () {
        $timeout(function () {
            page = 0;
            pageLimit = 1;
            $scope.recados = [];
            getRecados();
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
