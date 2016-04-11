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
	var i = 0;
	var soegetekst = info.selectionText.replace(/\./g, '').replace(/,/g, '').replace(/\//g, ' ');
	$.map((soegetekst).split(' '), function(nytOrd) {
		if (i < 5) {
			$.ajax({
				url: URL + '/ordbog?query=' + nytOrd,
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
					chrome.notifications.create(nytOrd, opt);
				},
				error: function(html) {
					var opt = {
						type: 'basic',
						title: 'Ingen resultater med \"' + nytOrd + '"\'',
						message: 'Der blev ikke fundet nogen resultater med søgningen \"' + nytOrd + '"\'. Prøv en anden søgetekst.',
						iconUrl: 'img/ikon128.png',
						priority: 0
					}
					chrome.notifications.create(nytOrd, opt);
				}
			});
			chrome.notifications.onClicked.addListener(function notificationId() {
				chrome.tabs.create({url: URL + '/ordbog?query=' + nytOrd}, function tab() {
					chrome.notifications.clear(nytOrd);
				});
			})
		}
		i++;
	})
};