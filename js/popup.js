var ordnet = angular.module('ordnet', []);
ordnet.config([
    '$compileProvider', function( $compileProvider ) {   
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }]);
ordnet.constant('URL', 'http://ordnet.danielwinther.dk/public');
ordnet.controller('OrdnetController', function($scope, $http, $location, URL) {
    $scope.initialiser = function() {        
        $scope.manifest = chrome.runtime.getManifest();
        $scope.background = {
            'background': 'url("' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box' 
        };

        if ($location.search().soegetekst != null) {
            $scope.soegetekst = $location.search().soegetekst;
            soeg($scope.soegetekst);    
        }
    };
    $scope.vedAendring = function() {
        soeg($scope.soegetekst);
    };
    $scope.menteDuKlik = function(mente) {
        $scope.soegetekst = mente;  
        soeg($scope.soegetekst);
    };
    function soeg(soegetekst) {
        $scope.luk = false;
        $http.get(URL + '/ord/' + soegetekst)
        .then(function(response) {
            var html = response.data;

            $scope.ord = html.ord;
            $scope.ordklasse = html.ordklasse;
            $scope.boejning = html.boejning;
            $scope.udtale = html.udtale;
            $scope.udtaleAudio = html.udtaleAudio;
            $('audio').attr('src', html.udtaleAudio);
            $scope.oprindelse = html.oprindelse;
            $scope.andet = html.andet;
            $scope.betydninger = html.betydninger;
            $scope.menteDu= html.menteDu;
        }, function(response) {
            $scope.ord = 'Ingen resultater med "' + soegetekst + '"';
        });
    }
    $scope.afspilUdtale = function(mente) {
        $('audio').trigger('play');
    };
    $scope.dagensOrd = function() {
        $http.get(URL + '/dagens-ord')
        .then(function(response) {
            var html = response.data;

            $scope.soegetekst = html.ord;
            soeg($scope.soegetekst);
        });
    };
});
