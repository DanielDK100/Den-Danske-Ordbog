var ordnet = angular.module('ordnet', []);
ordnet.constant('URL', 'http://ordnet.dk/ddo/ordbog?query=');
ordnet.controller('OrdnetController', function($scope, $http, $location, URL) {
    $scope.init = function() {
        $scope.manifest = chrome.runtime.getManifest();
        $('[data-toggle="tooltip"]').tooltip(); 

        if ($location.search().soegetekst != null) {
            $scope.soegetekst = $location.search().soegetekst;
            $scope.soeg($scope.soegetekst);    
        }
    };
    $scope.onChange = function() {
        $scope.soeg($scope.soegetekst);
    };
    $scope.menteDuClick = function(mente) {
        $scope.soegetekst = mente;  
        $scope.soeg($scope.soegetekst);
    };
    $scope.soeg = function(soegetekst) {
        $http.get(URL + soegetekst)
        .then(function(response) {
            var html = response.data;

            var ord = new Array();
            $('div.definitionBoxTop > span.match', html).each(function(index) {
                ord.push($(this).text());
            });
            $scope.ord = ord;
            $scope.ordklasse = $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text() ? $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text() : 'Ingen';
            var betydninger = new Array();
            $('#content-betydninger .definitionBox > .tekstmedium > .definition', html).each(function(index) {
                betydninger.push($(this).text());
            });
            $scope.betydninger = betydninger;
            $scope.boejning = $(html).find('#id-boj > span.tekstmedium.allow-glossing').text() ? $(html).find('#id-boj > span.tekstmedium.allow-glossing').text() : null;
            $scope.udtale = $(html).find('#id-udt > span.tekstmedium.allow-glossing > span').text() ? $(html).find('#id-udt > span.tekstmedium.allow-glossing > span').text() : null;
            $scope.oprindelse = $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() ? $(html).find('#id-ety > span.tekstmedium.allow-glossing').text() : null;
            ///$scope.synonymer = $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym > span:nth-child(2)').text() ? $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym > span:nth-child(2)').text() : 'Ingen';
            //$scope.antonymer = $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym > span:nth-child(4)').text() ? $(html).find('#content-betydninger > div:nth-child(2) > div.definitionBox.onym > span:nth-child(4)').text() : 'Ingen';
            var menteDu = new Array();
            $('#alikebox-show-all > a', html).each(function(index) {
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
        $scope.synonym = fejl;
        $scope.antonymer = fejl;
        $scope.menteDu = fejl;
    }
});