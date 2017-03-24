/* global angular, localStorage */

(function() {

    var eresData = function($log, $location) {

        var monthsPortugese = [{
                'text': 'Janeiro',
                'value': 1
            }, {
                'text': 'Fevereiro',
                'value': 2
            }, {
                'text': 'Março',
                'value': 3
            }, {
                'text': 'Abril',
                'value': 4
            }, {
                'text': 'Maio',
                'value': 5
            }, {
                'text': 'Junho',
                'value': 6
            }, {
                'text': 'Julho',
                'value': 7
            }, {
                'text': 'Agosto',
                'value': 8
            }, {
                'text': 'Setembro',
                'value': 9
            }, {
                'text': 'Outubro',
                'value': 10
            }, {
                'text': 'Novembro',
                'value': 11
            }, {
                'text': 'Dezembro',
                'value': 12
            }

        ];

        function getData(key) {
            return localStorage.getItem(key);

        }

        function updateData(key, value) {
            localStorage.setItem(key, value);
        }

        function deleteData(key) {
            localStorage.removeItem(key);
        }

        function getLocation() {

            return ($location.path().substr(1));
        }

        return {
            getData: getData,
            updateData: updateData,
            deleteData: deleteData,
            getLocation: getLocation,
            monthsPortugese: monthsPortugese
        };
    };

    var module = angular.module("eresApp");
    module.factory("eresData", eresData);

}());