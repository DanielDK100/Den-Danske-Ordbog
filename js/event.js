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
	var manifest = chrome.runtime.getManifest();
	var i = 0;
	var soegetekst = info.selectionText.replace(/\./g, '').replace(/,/g, '').replace(/\//g, ' ');
	$.map((soegetekst).split(' '), function(nytOrd) {
		if (i < 5) {
			$.ajax({
				method: 'GET',
				url: URL + '/ordbog?query=' + nytOrd
			})
			.done(function(html) {
				var ord = new Array();
				$('div.definitionBoxTop > span.match', html).each(function() {
					ord.push($(this).text().replace(/\d+/g, ''));
				});
				var betydning = $(html).find('#betydning-1 > span > span').text();
				var ordklasse = $(html).find('div.definitionBoxTop > span.tekstmedium.allow-glossing').text();

				var opt = {
					type: 'basic',
					title: ord.toString(),
					message: betydning,
					contextMessage: ordklasse,
					iconUrl: manifest.icons['128'],
					priority: 0
				}
				chrome.notifications.create(nytOrd, opt);
			}).fail(function(html) {
				var menteDu = new Array();
				$('#alikebox-show-all > a', html.responseText).each(function() {
					menteDu.push($(this).text());
				});

				var opt = {
					type: 'basic',
					title: 'Ingen resultater med \"' + nytOrd + '\"',
					message: 'Mente du: ' + menteDu.toString(),
					iconUrl: manifest.icons['128'],
					priority: 0
				}
				chrome.notifications.create(nytOrd, opt);
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