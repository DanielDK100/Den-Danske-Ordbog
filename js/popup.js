var ordnet = angular.module('ordnet', ['ngSanitize']);
ordnet.controller('OrdController', function($scope, $http) {
    $scope.initialiser = function() {
        $scope.manifest = chrome.runtime.getManifest();
        $scope.background = {
            'background': 'url("' + $scope.manifest.icons['128'] + '") no-repeat right / 20px content-box'
        }
    };
    $scope.vedAendring = function() {
        soeg($scope.soegetekst);
    };
    /*function autocomplete(soegetekst) {
        $http.get('http://ordnet.dk/ws/ddo/livesearch?text=' + soegetekst + '&size=5')
        .then(function(response) {
            $('#soegetekst').autocomplete({
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
    }*/
    function soeg(soegetekst) {
        $.get('http://ws.dsl.dk/ddo/query?q=' + soegetekst)
        .then(function(html) {
            _gaq.push(['_trackEvent', 'Søgning', 'Popup', soegetekst]);
            var html = $(html).filter('.ar')[0];

            $scope.$apply(function() {
                $scope.html = $(html).html() ? $(html).html() : '<h3>Ingen resultater med \"' + soegetekst + '\"</h3>';
            });
        });
    }
});