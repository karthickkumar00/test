/* global app*/
app.controller('SingleRecadosController', function ($scope, $state, $stateParams, $log, eresApi, $timeout,
        eresData, toastr, moment, $q, toastr, moment, $ionicPopup, $rootScope, $location) {
    $scope.myGoBack = function () {
        $state.go('dashboard');
    };
    $scope.recado={};
    var postId = $stateParams.postId;
    var token = eresData.getData("x-auth-sb");
    
    
    var recadosPosts = JSON.parse(eresData.getData("recados-posts"));
        
        angular.forEach(recadosPosts, function(post, index){
            
            $log.info("Post ", post);
            if(post.id == postId) {
                $scope.recado = post;
            }
            
        });
    
    
    /**
     * getting the current recad
     */
    function getRecados() {

        var endpoint = "mobile/v1/recados" + "/?id=" + postId;
        var config = {
            method: 'GET',
            headers: {
                'x-auth-sb': token
            }


        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {
                    $rootScope.$broadcast('loading:hide');
                    if (success.data.code !== "get_recados_success") {

                        return false;
                    }
                    $scope.recado = success.data.data;                        
                        var splitDate = success.data.data.date.split(' ');
                        var splitMonth = splitDate[0];
                        var DateObj = splitDate[1].split(',');
                        var Date = DateObj[0];
                        var year = splitDate[2];
                        var month = moment().month(splitMonth).format("MM");
                        $scope.recado.date = Date + '/' + month + '/' + year;
                        //$scope.recado.date = moment(formatDate).format('l');
                 

                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');

                }
        );
    }
//    getRecados();
});

