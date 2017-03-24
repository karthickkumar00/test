(function () {
    angular.module('eresApp')
            .directive('miniCurrentlyPlaying', miniCurrentlyPlaying);

    function miniCurrentlyPlaying() {
        return {
            restrict: 'A',
            scope: {},
            replace: true,
            templateUrl: "assets/templates/directives/mini-currently-playing.html",
            controller: controller
        };

        function controller($rootScope, $scope, $log, $ionicModal, CONFIG, $cordovaMedia) {

            var initCompleted;
            ;
            var isPlaying = false;
            var stream;

            initCompleted = false;

            function init() {

                var audioUrl = CONFIG.radio_url;
                media = $cordovaMedia.newMedia(audioUrl);
                $log.info("initialised media", media);

                initCompleted = true;
            }

            $scope.play = function () {
                
                if(isPlaying === true) {
                    
                    return;
                }
                if (window.Stream) {
                    stream = new window.Stream(CONFIG.radio_url);
                    //test stream: stream = new window.Stream('http://69.46.75.99:80');
                    stream.play();
                    isPlaying = true;
                }
            };

            $scope.pause = function () {
                
                if(!isPlaying) {
                    return;
                }
                if (!stream) {
                    return;
                }
                stream.stop();
                isPlaying = false;
            };
        }

    }

})();