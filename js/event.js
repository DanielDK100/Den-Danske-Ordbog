const URL = 'http://ordnet.dk/ddo';
chrome.runtime.onInstalled.addListener(function() {
	var id = chrome.contextMenus.create({
		title: 'Slå \"%s\" op i ordbogen', 
		contexts:['selection'],
		id: 'context' + 'selection'
	});  
});
chrome.contextMenus.onClicked.addListener(klikHandler);
function klikHandler(info, tab) {

	$.ajax({
		url: URL + '/ordbog?query=' + info.selectionText,
		type: 'GET',
		success: function(html){ 
			var ord = new Array();
			$('div.definitionBoxTop > span.match', html).each(function() {
				ord.push($(this).text());
			});
			var betydning = $(html).find('#betydning-1 > span > span').text();
			var ordklasse = $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text();
			
			var opt = {
				type: 'basic',
				title: ord.toString(),
				message: betydning,
				contextMessage: ordklasse,
				iconUrl: 'img/ikon128.png',
				priority: 0
			}
			chrome.notifications.create('opslag', opt);
		},
		error: function(html) {
			var opt = {
				type: 'basic',
				title: 'Ingen resultater med \"' + info.selectionText + '\"',
				message: 'Der blev ikke fundet nogen resultater med søgningen \"' + info.selectionText + '\". Prøv en anden søgetekst.',
				iconUrl: 'img/ikon128.png',
				priority: 0
			}
			chrome.notifications.create('opslag', opt);
		}
	});

	chrome.notifications.onClicked.addListener(function notificationId() {
		chrome.tabs.create({url: URL + '/ordbog?query=' + info.selectionText}, function tab() {
			chrome.notifications.clear('opslag');
		});
	})
};