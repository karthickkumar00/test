/* global app, angular */
app.controller('PollsController', function ($scope, $state, eresApi, eresData, $rootScope, toastr,
        $log, eresPopup) {


    var pollId;
    $scope.data = {};
    $scope.data.answer = [];
    var token = eresData.getData("x-auth-sb");

    function getPolls() {
        var endpoint = "mobile/v1/vote/";
        var config = {
            method: 'GET',
            headers: {
                'x-auth-sb': token

            }
        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {
                    $rootScope.$broadcast('loading:hide');

                    if (success.data.code !== "get_poll_success") {


                        return false;
                    }
//                pollContent = eresPolls.getAllPolls(success.data.data);

                    $scope.pollData = success.data.data.questions;
                    pollId = success.data.data.poll_id;
                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');
                }
        );
    }

    $scope.sendPoll = function () {

        var data = [];
        $log.log("answer", $scope.data.answer);
        var noEmptyField = true;
        angular.forEach($scope.pollData, function (poll, index) {
            var currentPoll = {};
            currentPoll.poll_id = pollId;
            currentPoll.question = $scope.pollData[index].question;
            currentPoll.answer = $scope.data.answer[index];
            currentPoll.type = $scope.pollData[index].type;


            if (!$scope.data.answer[index]) {

                noEmptyField = false;
            }

            if (poll.type === 'checkbox') {
                var isValueTrue = false;
                var checkboxAnswer = "";
                angular.forEach($scope.data.answer[index], function (answer, answerIndex) {
                    if (answer) {
                        checkboxAnswer += (answer + ",");
                    }
                    if (answer) {
                        isValueTrue = true;
                    }
                });
                if (isValueTrue === false) {

                    noEmptyField = false;
                }
                $log.log(checkboxAnswer);

                checkboxAnswer = checkboxAnswer.slice(0, -1);
                $log.log(checkboxAnswer);
                currentPoll.answer = checkboxAnswer;
            }

            data[index] = currentPoll;

        });

        if (noEmptyField === false) {

            eresPopup.showAlert("Erro", "Os campos vazios não são permitidos");
            return false;
        }

        $log.log(data);
        var endpoint = "mobile/v1/vote";
        var config = {
            method: 'POST',
            headers: {
                'x-auth-sb': token
            },
            data: {
                "data": data
            }
        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {
                    $rootScope.$broadcast('loading:hide');

                    if (success.data.code !== "insert_poll_success") {
                        

                        return false;
                    }
                    $scope.pollData = false;
                        checkingPollLog();

                    toastr.success("Por obrigado por participar");

                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');
                }
        );



    };
    
    /**
     * getting all poll logs, 
     */
    function checkingPollLog() {

        var endpoint = "mobile/v1/log/";
        var config = {
            method: 'GET',
            headers: {
                'x-auth-sb': token

            }
        };

        eresApi.apiRequest(endpoint, config).then(
                function (success) {

                    if (success.data.code !== "get_logs_success") {
                        
                        if (success.data.code !== "not_found_get_logs_error") {
                            
                            $rootScope.$broadcast('loading:hide');
                            return false;
                        }
                        getPolls();
                        return true;
                    }
                    $rootScope.$broadcast('loading:hide');
                    
                    $scope.data.pollLogs = success.data.data;
                    
                    return false;
                },
                function (error) {
                    $rootScope.$broadcast('loading:hide');
                }
        );

    }

    checkingPollLog();
});