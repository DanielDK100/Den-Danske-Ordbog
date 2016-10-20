var ordnet = angular.module('ordnet', []);
ordnet.config([
    '$compileProvider', function( $compileProvider ) {   
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }]);
ordnet.constant('URL', 'http://ordnet.dk');
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
    $scope.lukAutocomplete = function() {
        $scope.luk = true;
    };
    $scope.menteDuKlik = function(mente) {
        $scope.soegetekst = mente;  
        soeg($scope.soegetekst);
    };
    function soeg(soegetekst) {
        $scope.luk = false;
        var ord = new Array();
        var betydninger = new Array();
        var menteDu = new Array();

        $http.get(URL + '/ddo/ordbog', {params: {query: soegetekst}})
        .then(function(response) {
            var html = response.data;

            $('div.definitionBoxTop > span.match', html).each(function() {
                ord.push($(this).text().replace(/\d+/g, ''));
            });

            $scope.ord = ord;
            $scope.ordklasse = $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text() ? $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text() : null;

            $('#content-betydninger .definitionBox > .tekstmedium > .definition', html).each(function() {
                betydninger.push($(this).text());
            });

            $scope.betydninger = betydninger;
            $scope.boejning = $(html).find('#id-boj > span.tekstmedium.allow-glossing').text() ? $(html).find('#id-boj > span.tekstmedium.allow-glossing').text() : null;
            $scope.udtale = $(html).find('#id-udt > span.tekstmedium.allow-glossing > span').text() ? $(html).find('#id-udt > span.tekstmedium.allow-glossing > span').text() : null;
            $scope.udtaleAudio = $(html).find('#id-udt > span.tekstmedium.allow-glossing > span > audio > div > a').attr('href') ? $(html).find('#id-udt > span.tekstmedium.allow-glossing > span > audio > div > a').attr('href') : null;
            $('audio').attr('src', $scope.udtaleAudio);
            $scope.oprindelse = $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() ? $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() : null;
            $scope.andet = $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym').text() ? $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym').text() : null;

            $('#alikebox-show-all > a', html).each(function() {
                menteDu.push($(this).text());
            });
            $scope.menteDu = menteDu;
        }, function errorCallback(response) {
            var html = response.data;
            fejl(null);
        });
    }
    $scope.afspilUdtale = function(mente) {
        $('audio').trigger('play'); 
    };
    function fejl(fejl) {
        $scope.autoComplete = fejl;
        $scope.ord = fejl;
        $scope.ordklasse = fejl;
        $scope.betydninger = fejl;
        $scope.boejning = fejl;
        $scope.udtale = fejl;
        $scope.udtaleAudio = fejl;
        $scope.oprindelse = fejl;
        $scope.andet = fejl;
        $scope.menteDu = fejl;
    }
    $scope.dagensOrd = function() {
        $http.get(URL + '/ddo')
        .then(function(response) {
            var html = response.data;

            var dagensOrd = $(html).find('.dagensord > .match').text() ? $(html).find('.dagensord > .match').text() : null;
            if (dagensOrd != null) {
                $scope.soegetekst = dagensOrd;
                soeg($scope.soegetekst);
            }
        });
    };
});