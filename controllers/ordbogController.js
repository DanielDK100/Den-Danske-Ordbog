angular.module('Ordbog', ['ngSanitize', 'ngAnimate'])
.controller('OrdbogController', ['$scope', function($scope) {
  $scope.initialiser = function() {
    console.log(chrome.i18n.getMessage('popupUdvikling') + ' AngularJS ' + angular.version.full);
    $scope.soegetekst = '';
    $scope.indlaes = false;
    $scope.sprog = chrome.i18n.getMessage('@@ui_locale');
    $scope.soegehjaelp = chrome.i18n.getMessage('popupSoegehjaelp');
    $scope.soegehjaelpBegynder = chrome.i18n.getMessage('popupSoegehjaelpBegynder');
    $scope.soegehjaelpEnder = chrome.i18n.getMessage('popupSoegehjaelpEnder');
    $scope.placeholder = chrome.i18n.getMessage('popupPlaceholder');
    $scope.menteDu = chrome.i18n.getMessage('popupMenteDu');
    $scope.indlaeser = chrome.i18n.getMessage('popupIndlaeser');
    $scope.manifest = chrome.runtime.getManifest();
    $scope.background = {
        'background': 'url("../' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box'
    }
};
$scope.vedAendring = function(soegetekst, erBogstav) {
    if (erBogstav) {
        $scope.soegetekst += soegetekst;
    }
    else {
        $scope.soegetekst = soegetekst;
    }
    soeg($scope.soegetekst);
};
function soeg(soegetekst) {
    if (soegetekst !== '') {
        $scope.ordbog = false;
        $scope.indlaes = true;
        $.get(konfiguration.urlWs, {q: soegetekst})
        .done(function(html) {
            _gaq.push(['_trackEvent', 'Søgning', 'Popup', soegetekst]);
            var opslag = $(html).filter('.ar')[0];
            var ordforslag = [];
            angular.forEach($(html).filter('.nomatch').find('li'), function(ord, key) {
                if (key >= 5) {
                    return false;
                }
                this.push($(ord).text());
            }, ordforslag);
            $scope.ordforslag = ordforslag;
            $scope.opslag = $(opslag).html() ? $(opslag).html() : '<h3>' + chrome.i18n.getMessage('extIngenResultater') + ' \"' + soegetekst + '\"</h3>';
            $scope.indlaes = false;
            $scope.ordbog = true; 
        }).always(function() {
            $scope.$apply();   
        });
    }
    else {
        $scope.ordforslag = null;
        $scope.opslag = null;
    }
}
}])
function googleTranslateElementInit() {
    if (chrome.i18n.getMessage('@@ui_locale') != 'da') {
        new google.translate.TranslateElement({pageLanguage: 'da', includedLanguages: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, gaTrack: true, gaId: konfiguration.googleAnalytics}, 'google_translate_element');
    }
}