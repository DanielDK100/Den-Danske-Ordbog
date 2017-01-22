const URL = 'http://ws.dsl.dk/ddo/query?q=';
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
			var opt = {
				type: 'basic',
				title: '',
				message: '',
				contextMessage: '',
				iconUrl: manifest.icons['128'],
			}
			$.get(URL + nytOrd, function(){})
			.done(function(html) {
				var html = $(html).filter('.ar')[0];

				opt.title = $(html).find('.head').first().text() ? $(html).find('.head').first().text().trim() : 'Ingen resultater med \"' + nytOrd + '\"';
				opt.message = $(html).find('.dtrn').first().text().trim();
				opt.contextMessage = $(html).find('.pos').first().text().trim();
			}).always(function(){
				chrome.notifications.create(nytOrd, opt);
			});
		}
		i++;
	})
};
chrome.notifications.onClicked.addListener(function notificationId(nytOrd) {
	chrome.tabs.create({url: 'http://ordnet.dk/ddo/ordbog?query=' + nytOrd}, function tab() {
		chrome.notifications.clear(nytOrd);
	});
})