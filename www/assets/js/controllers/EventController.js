/* global angular */
app.controller('EventController', function ($scope, $state, $timeout, eresData, eresApi, $log, $rootScope, toastr,
        $cordovaNetwork) {

    var token = eresData.getData("x-auth-sb");
    $scope.tabs = [];
    $scope.event = {};
    var datesUniqueList = [];
    var eventsSortedList = [];

    /**
     * geting all events from api
     * handling all date format conversions
     */
    function getAllEvents() {
        var endpoint = "mobile/v1/event";
        var config = {
            method: 'GET',
            headers: {
                'x-auth-sb': token
            }
        };
        eresApi.apiRequest(endpoint, config).then(
                function (success) {
                    $rootScope.$broadcast('loading:hide');
                    $scope.events = success.data.data.posts;
                    $log.log("events ", $scope.events);
                    if (!$scope.events.length) {

                        toastr.warning('Não há roteiro para este de usuário', 'Atenção');

                    }
                    angular.forEach($scope.events, function (event, key) {
                        event.events_date = event.event_date;
                        if (event.event_date === "") {
                            event.event_date = moment().format('L');
                        }
                        var dateSplit = event.event_date.split('/');
                        var day = dateSplit[0];
                        var month = dateSplit[1];
                        var year = dateSplit[2];
                        var dateConcat = month + '/' + day + '/' + year;
                        var dateFormat = moment(dateConcat).format('llll');
                        var dateDay = dateFormat.split(",");
                        var dateBits = dateDay[1].split(' ');
                        var day = dateDay[0];
                        var date = dateBits[1];
                        var month = dateBits[3];
                        event.event_date = day + ', ' + date + '/' + month;

                    })

                    $log.log($scope.events);
                    eresData.updateData("events-posts", JSON.stringify($scope.events));
                    $log.log("datesUniqueList ", datesUniqueList);
                    $log.log("eventsSortedList ", eventsSortedList);
                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');
                }
        );
    }
    /**
     * The offline caching logic
     * If the app is online all data will be taken from api, if offline 
     * local storage is handled as fallback(if data exists) 
     * 
     */
    if ($cordovaNetwork.isOnline()) {
        getAllEvents();
    } else {

        var postData = eresData.getData("events-posts");
        if (!postData) {
            toastr.info("Não foi possível encontrar todos os dados salvos", 'Erro');
            return false;
        } else {

            $scope.events = JSON.parse(postData);
        }

    }
});