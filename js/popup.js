var ordnet = angular.module('ordnet', []);
ordnet.constant('URL', 'http://ordnet.dk/ddo/ordbog?query=');
ordnet.controller('OrdnetController', function($scope, $http, URL) {
    $scope.init = function() {
        $scope.manifest = chrome.runtime.getManifest();
    };
    $scope.onChange = function() {
        $scope.soeg();
    };
    $scope.soeg = function() {
        $http.get(URL + $scope.soegetekst)
        .then(function(response) {
            var html = response.data;

            $scope.betydning1 = $(html).find('#betydning-1 > span > span.definition').text() ? $(html).find('#betydning-1 > span > span.definition').text() : 'Tom';
            $scope.synonym = $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym > span.inlineList').text() ? $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym > span.inlineList').text() : 'Ingen';

            var menteDu = new Array();
            $('#alikebox-show-all > a', html).each(function(index) {
                menteDu.push($(this).text());
            });
            $scope.menteDu = menteDu;
        }, function errorCallback(response) {
            $scope.betydning1 = 'Ingen';
            $scope.synonym = 'Ingen';
            $scope.menteDu = null;
        });
    }
});