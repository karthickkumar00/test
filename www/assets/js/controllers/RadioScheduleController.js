/* global app, angular */
app.controller('RadioScheduleController', function ($scope, $state, eresData, eresApi, $rootScope, $log, $timeout, CONFIG) {

    //$rootScope.$broadcast('loading:show');

    /**
     * 
     * @returns {undefined}
     */
    function getRadioSchedule() {
        var endpoint = '';
        eresApi.apiGlobalRequest(endpoint).then(
                function (success) {

                }, function (error) {

        });
    }
//getRadioSchedule();

});