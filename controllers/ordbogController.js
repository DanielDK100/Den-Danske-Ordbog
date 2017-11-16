angular.module('Ordbog', ['ngSanitize', 'ngAnimate'])
.controller('OrdbogController', ['$scope', function($scope) {   
  $scope.initialiser = function() {
    console.log(chrome.i18n.getMessage('popupUdvikling') + '%c%s', 'color: #B52E31;', ' AngularJS ' + angular.version.full);
    $scope.soegetekst = '';
    $scope.sprog = chrome.i18n.getMessage('@@ui_locale');
    $scope.placeholder = chrome.i18n.getMessage('popupPlaceholder');
    $scope.menteDu = chrome.i18n.getMessage('popupMenteDu');
    $scope.indlaeser = chrome.i18n.getMessage('popupIndlaeser');
    $scope.manifest = chrome.runtime.getManifest();
    $scope.background = {
        'background': 'url("../' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box'
    };
};
$scope.vedAendring = function(soegetekst, erBogstav, menteDu) {
    erBogstav ? $scope.soegetekst += soegetekst : $scope.soegetekst = soegetekst;
    soeg($scope.soegetekst, menteDu);
};
function soeg(soegetekst, menteDu) {
    if (soegetekst !== '') {
        $scope.indlaes = true;
        $.get(konfiguration.urlWs, {q: soegetekst})
        .done(function(html) {
            menteDu ? ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Popup - ordforslag', eventLabel: soegetekst}) : ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Popup', eventLabel: soegetekst});
            var betydninger = []
            angular.forEach($(html).filter('.ar'), function(betydning) {
                this.push($(betydning).html());
            }, betydninger);
            var ordforslag = [];
            angular.forEach($(html).filter('.nomatch').find('li'), function(ord, key) {
                if (key >= 5) {
                    return false;
                }
                this.push($(ord).text());
            }, ordforslag);
            $scope.ordforslag = ordforslag;
            $scope.ingenResultater = chrome.i18n.getMessage('extIngenResultater') + ' \"' + soegetekst + '\"';
            $scope.betydninger = betydninger;
            $scope.indlaes = false;
        }).always(function() {
            $scope.$apply();
        });
    }
    else {
        $scope.ordforslag = null;
        $scope.betydninger = null;
    }
}
}])
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'da', includedLanguages: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, gaTrack: true, gaId: konfiguration.googleAnalytics}, 'google_translate_element');
}