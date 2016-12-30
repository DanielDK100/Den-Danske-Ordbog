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
			$.getJSON(URL + '/ord/' + nytOrd, function(){})
			.done(function(html) {
				opt.title = html.ord;
				opt.message = html.betydninger[0];
				opt.contextMessage = html.ordklasse;
			}).fail(function(html) {
				opt.title = 'Ingen resultater med \"' + nytOrd + '\"';
				opt.message = 'Mente du: ' + html.menteDu.toString();
				opt.contextMessage = null;
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