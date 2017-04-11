function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'da', includedLanguages: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, gaTrack: true, gaId: konfiguration.googleAnalytics}, 'google_translate_element');
}
var ordbog = angular.module('ordbog', ['ngSanitize', 'ngAnimate']);
ordbog.controller('OrdbogController', function($scope) {
    $scope.initialiser = function() {
        console.log(chrome.i18n.getMessage('popupUdvikling') + ' AngularJS ' + angular.version.full);
        $scope.indlaes = false;
        $scope.sprog = chrome.i18n.getMessage('@@ui_locale');
        $scope.placeholder = chrome.i18n.getMessage('popupPlaceholder');
        $scope.indlaeser = chrome.i18n.getMessage('popupIndlaeser');
        $scope.manifest = chrome.runtime.getManifest();
        $scope.background = {
            'background': 'url("../' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box'
        }
    };
    $scope.vedAendring = function() {
        soeg($scope.soegetekst);
    };
    function soeg(soegetekst) {
        if (soegetekst !== '') {
            $scope.ordbog = false;
            $scope.indlaes = true;
            $.get(konfiguration.urlWs, {q: soegetekst})
            .then(function(html) {
                _gaq.push(['_trackEvent', 'Søgning', 'Popup', soegetekst]);
                var html = $(html).filter('.ar')[0];

                $scope.html = $(html).html() ? $(html).html() : '<h3>' + chrome.i18n.getMessage('extIngenResultater') + ' \"' + soegetekst + '\"</h3>';
                $scope.indlaes = false;
                $scope.ordbog = true;

                $scope.$apply();
            });
        }
        else {
            $scope.html = null;
            $scope.soegetekst = null;
        }
    }
});