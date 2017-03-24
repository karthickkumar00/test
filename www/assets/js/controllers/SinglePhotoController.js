/* global app*/
app.controller('SinglePhotoController', function ($scope, $state, $stateParams, $log, eresApi, $timeout,
        eresData, toastr, moment, $q, toastr, moment, $ionicPopup, $rootScope, $location) {
    $scope.myGoBack = function () {
        $state.go('dashboard');
    };

    var postId = $stateParams.postId;
    $scope.postType = "FOTO";
    $scope.postId = postId;
    var token = eresData.getData("x-auth-sb");
    $scope.data = {};
    $scope.data.likePost = {};
    $scope.data.likeComment = {};
    $scope.data.userAvatar = eresData.getData("user-avatar");
    $scope.data.userName = eresData.getData("user-name");
    var userId = eresData.getData("user-id");
    $scope.data.userId = userId;
    
    
    /**
     * function to get the details of the current photo
     */
    function getPostDetails() {

        var endpoint = "mobile/v1/photo" + "/?id=" + postId;
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

                        return false;
                    }
                    $scope.post = success.data.data;


                    $scope.post.comment_count = 0;
                    if ($scope.post.current_user_liked === 1) {

                        $scope.data.likePost = "ion-ios-heart";
                    } else {

                        $scope.data.likePost = "ion-ios-heart-outline";
                    }
                    if (!$scope.post.post_like_count || $scope.post.like_count === null) {
                        $scope.post.post_like_count = 0;
                    }
                    userId = parseInt(userId);
                    var postedUserId = parseInt($scope.post.post_author);
                    $scope.post.editablePost = false;


                    if (userId === postedUserId) {

                        $log.log("asdasd");
                        $scope.post.editablePost = true;

                    }

                    $scope.post.post_like_count = parseInt($scope.post.post_like_count);
                    
                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');
                }
        );
    }
    getPostDetails();
    
    /**
     * function to like a post
     * calls 'callLikeApi' function to place like
     * Classes for like button are set from here
     * 
     * @param {string/integer} postId
     * 
     */
    $scope.likePost = function (postId) {


        postId = parseInt(postId);
        var config = {
            method: 'POST',
            headers: {
                'x-auth-sb': token
            },
            data: {
                'post_id': postId,
                'is_comment': 0
            }
        };

        callLikeApi(config).then(
                function (success) {
                    $log.log(success);
                    if (success.data.message === "liked") {


                        $scope.post.post_like_count =
                                $scope.post.post_like_count + 1;
                        $scope.data.likePost = "ion-ios-heart";
                    }
                    if (success.data.message === "unliked") {


                        $scope.post.post_like_count =
                                $scope.post.post_like_count - 1;
                        $scope.data.likePost = "ion-ios-heart-outline";
                    }

                },
                function (error) {
                    $log.log(error);
                }
        );

    };
    
    /**
     *  general binding function for all like apis, since comment module is removed, this can be me merged with 
     * '$scope.likePost'
     * 
     * @param {type} config
     * 
     * @returns {$q@call;defer.promise}
     */
    function callLikeApi(config) {

        var endpoint = "mobile/v1/like/";
        var deferred = $q.defer();
        eresApi.apiRequest(endpoint, config).then(
                function (success) {
                    $rootScope.$broadcast('loading:hide');
                    deferred.resolve(success);
                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');
                    deferred.reject(error);
                }
        );
        return deferred.promise;
    }
    
    /**
     * deleting a post, option avaailable only if this user is the post author,
     * this condition is checked in the scope
     * 
     * @param {type} postId
     */
    $scope.deletePost = function (postId) {

        var confirmPopup = $ionicPopup.confirm({
            title: "Atenção",
            template: 'Tem certeza de que deseja excluir este post?',
            cancelText: 'Não',
            okText: 'sim'
        });

        confirmPopup.then(function (res) {
            if (res) {

                var endpoint = "mobile/v1/photo/?post_id=" + postId;
                var config = {
                    method: 'DELETE',
                    headers: {
                        'x-auth-sb': token
                    }
                };

                eresApi.apiRequest(endpoint, config).then(
                        function (success) {

                            $rootScope.$broadcast('loading:hide');
                            if (success.data.code !== "delete_photo_success") {
                                return false;
                            }
                            toastr.success("Sucesso");
                            $state.go("photos");
                        },
                        function (error) {

                            $rootScope.$broadcast('loading:hide');
                        }
                );

            } else {

            }
        });
    };
    
    /**
     * for navigating to edit photo page, option available only if this user is the post author,
     * this condition is checked in the scope
     * 
     * @param {type} postId
     */
    $scope.editPhoto = function (postId) {

        $location.path("/editphoto/" + postId);

    };

});

