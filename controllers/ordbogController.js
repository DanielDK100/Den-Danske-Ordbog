var ordbog = angular.module('ordbog', ['ngSanitize']);
ordbog.controller('OrdbogController', function($scope) {
    $scope.initialiser = function() {
        console.log(chrome.i18n.getMessage("popupUdvikling") + ' AngularJS ' + angular.version.full);
        $scope.placeholder = chrome.i18n.getMessage("popupPlaceholder");
        $scope.manifest = chrome.runtime.getManifest();
        $scope.background = {
            'background': 'url("' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box'
        }
    };
    $scope.vedAendring = function() {
        soeg($scope.soegetekst);
    };
    function soeg(soegetekst) {
        $.get(konfiguration.urlWs, {q: soegetekst})
        .then(function(html) {
            _gaq.push(['_trackEvent', 'Søgning', 'Popup', soegetekst]);
            var html = $(html).filter('.ar')[0];

            $scope.$apply(function() {
                $scope.html = $(html).html() ? $(html).html() : '<h3>' + chrome.i18n.getMessage("extIngenResultater") + ' \"' + soegetekst + '\"</h3>';
            });
        });
    }
});