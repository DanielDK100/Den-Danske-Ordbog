var ordnet = angular.module('ordnet', ['ngSanitize']);
ordnet.constant('URL', 'http://ws.dsl.dk/ddo/query?q=');
ordnet.controller('OrdController', function($scope, $http, URL) {
    $scope.initialiser = function() {
        $scope.manifest = chrome.runtime.getManifest();
        $scope.background = {
            'background': 'url("' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box'
        }
    };
    $scope.vedAendring = function() {
        soeg($scope.soegetekst);
        indlaesIndstillinger('autocomplete');
        if ($scope.resultat.autocomplete) {
            autocomplete($scope.soegetekst);
        }
    };
    function autocomplete(soegetekst) {
        $http.get('http://ordnet.dk/ws/ddo/livesearch?text=' + soegetekst + '&size=5')
        .then(function(response) {
            $('#autocomplete').autocomplete({
              source: response.data,
              autoFocus: true,
              select: function(event, ui) {
                soeg(ui.item.value);
            },
            open: function(event, ui) {
                $('.container').css('minHeight', 220);
            },
            close: function(event, ui) {
                $('.container').css('minHeight', 0);
            }
        });
        });
    }
    function soeg(soegetekst) {
        $.get(URL + soegetekst)
        .then(function(html) {
            var html = $(html).filter('.ar')[0];

            $scope.$apply(function() {
                $scope.html = $(html).html() ? $(html).html() : '<h3>Ingen resultater med \"' + soegetekst + '\"</h3>';
            });
        });
    }
    function indlaesIndstillinger(indstilling = null) {
        chrome.storage.sync.get(indstilling, function(resultat) {
            $scope.resultat = resultat;
        });
    }
});