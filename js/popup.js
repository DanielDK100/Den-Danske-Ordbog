var ordbog = angular.module('ordbog', ['ngSanitize']);
ordbog.controller('OrdController', function($scope) {
    $scope.initialiser = function() {
        $scope.manifest = chrome.runtime.getManifest();
        $scope.background = {
            'background': 'url("' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box'
        }
    };
    $scope.vedAendring = function() {
        soeg($scope.soegetekst);
    };
    function soeg(soegetekst) {
        $.get('http://ws.dsl.dk/ddo/query', {q: soegetekst})
        .then(function(html) {
            _gaq.push(['_trackEvent', 'Søgning', 'Popup', soegetekst]);
            var html = $(html).filter('.ar')[0];

            $scope.$apply(function() {
                $scope.html = $(html).html() ? $(html).html() : '<h3>Ingen resultater med \"' + soegetekst + '\"</h3>';
            });
        });
    }
});