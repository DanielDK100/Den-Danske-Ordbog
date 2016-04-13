var ordnet = angular.module('ordnet', []);
ordnet.config([
    '$compileProvider', function( $compileProvider ) {   
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }]);
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
        var ord = new Array();
        var betydninger = new Array();
        var menteDu = new Array();
        $http.get(URL + '/ordbog?query=' + soegetekst)
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
            $scope.oprindelse = $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() ? $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() : null;
            $scope.andet = $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym').text() ? $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym').text() : null;

            $('#alikebox-show-all > a', html).each(function() {
                menteDu.push($(this).text());
            });
            $scope.menteDu = menteDu;
        }, function errorCallback(response) {
            var html = response.data;
            fejl(null);

            $('#alikebox-show-all > a', html).each(function() {
                menteDu.push($(this).text());
            });
            $scope.menteDu = menteDu;

            var opt = {
                type: 'basic',
                title: 'Ingen resultater med \"' + $scope.soegetekst + '\"',
                message: 'Mente du: ' + menteDu.toString(),
                iconUrl: $scope.manifest.icons['128'],
                priority: 0
            }
            chrome.notifications.create($scope.soegetekst, opt);
        });
    }
    function fejl(fejl) {
        $scope.ord = fejl;
        $scope.ordklasse = fejl;
        $scope.betydninger = fejl;
        $scope.boejning = fejl;
        $scope.udtale = fejl;
        $scope.oprindelse = fejl;
        $scope.andet = fejl;
    }
    $scope.dagensOrd = function() {
        $http.get(URL)
        .then(function(response) {
            var html = response.data;

            var dagensOrd = $(html).find('.dagensord > .match').text() ? $(html).find('.dagensord > .match').text() : null;
            if (dagensOrd != null) {
                $scope.soegetekst = dagensOrd;
                $scope.soeg($scope.soegetekst);
            }
            else {
                var opt = {
                    type: 'basic',
                    title: 'Dagens ord blev ikke fundet',
                    message: 'Der blev ikke fundet nogen resultater med dagens ord.',
                    iconUrl: $scope.manifest.icons['128'],
                    priority: 0
                }
                chrome.notifications.create(opt);
            }
        });
    };
});