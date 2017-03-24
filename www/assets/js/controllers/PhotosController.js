/* global angular, app */
app.controller('PhotosController', function ($scope, $state, eresApi, eresData, $log, moment, $q, toastr,
        $timeout, $ionicPopup, $location, $rootScope, CONFIG, eresPopup) {

    $scope.data = {};
    $scope.data.likePost = {};
    $scope.data.likeComment = {};
    $scope.data.userAvatar = eresData.getData("user-avatar");
    $scope.data.userName = eresData.getData("user-name");
    var page = 0;
    var postPerPage = CONFIG.post_per_page;
    var pageLimit = 1;
    $scope.data.pageData = [];

    var token = eresData.getData("x-auth-sb");
    /**
     * grab all photos from api, assign it to the scope
     */
    function getPhotosAll() {
        page = ($scope.data.pageData.length / postPerPage) + 1;
        page = Math.ceil(page);
        
        var endpoint = "mobile/v1/photo?posts_per_page=" + postPerPage + "&page=" + page;
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
                    if (success.data.code !== "get_photo_success") {

                        return false;
                    }
                    pageLimit = angular.copy(success.data.data.pages);

                    if ($scope.data.pageData.length < postPerPage * page) {
                        $scope.data.pageData = $scope.data.pageData.concat(angular.copy(success.data.data.posts));
                        $timeout(function () {

                            success = null;
                        });

                    }

                    $log.info($scope.data.pageData);
                    angular.forEach($scope.data.pageData, function (post, postKey) {

                        post.comment_count = 0;
                        if (post.current_user_liked === 1) {

                            $scope.data.likePost[post.id] = "ion-ios-heart";
                        } else {

                            $scope.data.likePost[post.id] = "ion-ios-heart-outline";
                        }
                        if (!post.post_like_count || post.like_count === null) {
                            post.post_like_count = 0;
                        }
                        post.post_like_count = parseInt(post.post_like_count);

                    });
                },
                function (error) {

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast("scroll.refreshComplete");
                    $rootScope.$broadcast('loading:hide');
                }
        );

    }
    getPhotosAll();
    $scope.getPhotosAll = getPhotosAll;

    /**
     * function to like a post
     * calls 'callLikeApi' function to place like
     * Classes for like button are set from here
     * 
     * @param {type} postId
     * @param {type} index
     */
    $scope.likePost = function (postId, index) {

        $log.log(index);
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


                        $scope.data.pageData[index].post_like_count =
                                $scope.data.pageData[index].post_like_count + 1;
                        $scope.data.likePost[postId] = "ion-ios-heart";
                    }
                    if (success.data.message === "unliked") {


                        $scope.data.pageData[index].post_like_count =
                                $scope.data.pageData[index].post_like_count - 1;
                        $scope.data.likePost[postId] = "ion-ios-heart-outline";
                    }

                },
                function (error) {
                    $log.log(error);
                }
        );

    };

    /**
     * general binding function for all like apis, since comment module is removed,
     *  this can be me merged with '$scope.likePost'
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
     * navaigating to single photo page upon click event on the image
     * 
     * @param {type} postId
     */
    $scope.navigate = function (postId) {

        $log.log("Trying to navigate");
        $location.path("/photo/" + postId);

    };


    $rootScope.refreshAllPhotos = function () {
            $timeout(function () {
                page = 0;
                pageLimit = 1;
                $scope.data.pageData = [];
                getPhotosAll();
            });
                    
    };

    $scope.moreDataCanBeLoaded = function () {

        $log.info("page ", page, "pageLimit", pageLimit);
        if (page >= pageLimit) {

            return false;
        }
        return true;

    };

});