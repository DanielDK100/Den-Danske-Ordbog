var ordnet = angular.module('ordnet', []);
ordnet.constant('URL', 'http://ordnet.dk/ddo');
ordnet.controller('OrdnetController', function($scope, $http, $location, URL) {
    $scope.initialiser = function() {
        $scope.manifest = chrome.runtime.getManifest();
        $('[data-toggle="tooltip"]').tooltip(); 

        if ($location.search().soegetekst != null) {
            $scope.soegetekst = $location.search().soegetekst;
            $scope.soeg($scope.soegetekst);    
        }
    };
    $scope.vedAendring = function() {
        $scope.soeg($scope.soegetekst);
    };
    $scope.menteDuKlik = function(mente) {
        $scope.soegetekst = mente;  
        $scope.soeg($scope.soegetekst);
    };
    $scope.soeg = function(soegetekst) {
        $http.get(URL + '/ordbog?query=' + soegetekst)
        .then(function(response) {
            var html = response.data;

            var ord = new Array();
            $('div.definitionBoxTop > span.match', html).each(function() {
                ord.push($(this).text());
            });
            $scope.ord = ord;
            $scope.ordklasse = $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text() ? $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text() : null;
            var betydninger = new Array();
            $('#content-betydninger .definitionBox > .tekstmedium > .definition', html).each(function() {
                betydninger.push($(this).text());
            });
            $scope.betydninger = betydninger;
            $scope.boejning = $(html).find('#id-boj > span.tekstmedium.allow-glossing').text() ? $(html).find('#id-boj > span.tekstmedium.allow-glossing').text() : null;
            $scope.udtale = $(html).find('#id-udt > span.tekstmedium.allow-glossing > span').text() ? $(html).find('#id-udt > span.tekstmedium.allow-glossing > span').text() : null;
            $scope.oprindelse = $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() ? $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() : null;
            $scope.synonymerOgAntonymer = $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym').text() ? $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym').text() : null;
            var menteDu = new Array();
            $('#alikebox-show-all > a', html).each(function() {
                menteDu.push($(this).text());
            });
            $scope.menteDu = menteDu;

        }, function errorCallback(response) {
            fejlMeddelelse(null);
        });
    }
    function fejlMeddelelse(fejl) {
        $scope.ord = fejl;
        $scope.ordklasse = fejl;
        $scope.betydninger = fejl;
        $scope.boejning = fejl;
        $scope.udtale = fejl;
        $scope.oprindelse = fejl;
        $scope.synonymerOgAntonymer = fejl;
        $scope.menteDu = fejl;
    }
    $scope.dagensOrd = function() {
        $http.get(URL)
        .then(function(response) {
            var html = response.data;

            var dagensOrd = $(html).find('.dagensord > .match').text();
            $scope.soegetekst = dagensOrd;
            $scope.soeg($scope.soegetekst);
        });
    };
});