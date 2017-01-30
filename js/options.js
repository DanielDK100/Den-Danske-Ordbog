var ordnet = angular.module('ordnet', []);
ordnet.controller('IndstillingerController', function($scope) {
	$scope.initialiser = function() {
		$scope.manifest = chrome.runtime.getManifest();

		indlaesIndstillinger();
	};

	$scope.gemIndstillinger = function(vaerdi) {
		chrome.storage.sync.set({
			autocomplete: vaerdi
		});
	};

	function indlaesIndstillinger(indstilling = null) {
		chrome.storage.sync.get(indstilling, function(resultat) {
			$scope.resultat = resultat;
		});
	}
});