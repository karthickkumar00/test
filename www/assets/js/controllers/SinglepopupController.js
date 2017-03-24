/* global app, angular*/
app.controller('SinglepopupController',function($scope,$state, $stateParams, $log, eresApi, $timeout,
eresData, toastr, moment, $q, toastr, moment, $ionicPopup, $rootScope, $location){
    $scope.myGoBack = function() {
    $state.go('dashboard');
  };
    var postType = $stateParams.postType;
    var postId = $stateParams.postId;
    $scope.postType = postType;
    $scope.postId = postId;
    var token = eresData.getData("x-auth-sb");
    $scope.data = {};
    $scope.data.userAvatar = eresData.getData("user-avatar");
    $scope.data.userName = eresData.getData("user-name");
    var userId = eresData.getData("user-id");
    $scope.data.userId = userId;
    if(postType === "ssma") {
        
        var ssmaPosts = JSON.parse(eresData.getData("ssma-posts"));
        
        angular.forEach(ssmaPosts, function(post, index){
            
            $log.info("Post ", post);
            if(post.id == postId) {
                $scope.post = post;
            }
            
        });
        
    }
    if(postType === "dicas") {
        
        var dicasPosts = JSON.parse(eresData.getData("dicas-posts"));
        $log.log(dicasPosts)
        angular.forEach(dicasPosts, function(post, index){
            
            if(post.id == postId) {
                $scope.post = post;
            }
            
        });
    }
    
});

