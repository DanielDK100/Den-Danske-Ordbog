var ordnet = angular.module('ordnet', []);
ordnet.controller('IndstillingerController', function($scope) {
    $scope.initialiser = function() {
        $scope.manifest = chrome.runtime.getManifest();
    };
});