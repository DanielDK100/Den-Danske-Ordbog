var ordnet = angular.module('ordnet', ['ngSanitize']);
ordnet.config([
    '$compileProvider', function( $compileProvider ) {   
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }]);
ordnet.constant('URL', 'http://ws.dsl.dk/ddo/query?q=');
ordnet.controller('OrdnetController', function($scope, $location, URL) {
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
    function soeg(soegetekst) {
        $.get('http://ws.dsl.dk/ddo/query?q=' + soegetekst)
        .then(function(html) {
            var html = $(html).filter('.ar')[0];

            $scope.$apply(function() { 
               $scope.html = $(html).html() ? $(html).html() : '<h3>Ingen resultater med \"' + soegetekst + '\"</h3>';
           });
        }, function(html) {});
    }
});
