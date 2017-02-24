chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		title: 'Slå \"%s\" op i ordbogen', 
		contexts: ['selection'],
		id: 'context' + 'selection',
	});
});
chrome.contextMenus.onClicked.addListener(klikHandler);
chrome.notifications.onButtonClicked.addListener(knapHandler);
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
				buttons: [{title: 'Søg efter synonymer'}, {title: 'Søg efter antonymer'}],
			}
			$.get('http://ws.dsl.dk/ddo/query', {q: nytOrd})
			.done(function(html) {
				var html = $(html).filter('.ar')[0];
				var title = $(html).find('.head .k').first().text();

				if (!title) {
					opt.buttons = [];
				}
				opt.title = title ? title.trim().replace(/\d+/g, '') : 'Ingen resultater med \"' + nytOrd + '\"';
				opt.message = $(html).find('.dtrn').first().text().trim();
				opt.contextMessage = $(html).find('.m').first().text() ? $(html).find('.m').first().text().trim() : $(html).find('.pos').first().text().trim();
			}).always(function(){
				_gaq.push(['_trackEvent', 'Søgning', 'Event', nytOrd]);
				chrome.notifications.create(nytOrd, opt);
			});
		}
		i++;
	})
};
function knapHandler(info, tab) {
	var manifest = chrome.runtime.getManifest();
	var opt = {
		type: 'list',
		title: '',
		message: '',
		iconUrl: manifest.icons['128'],
		items: [],
	}

	$.get('http://ws.dsl.dk/ddo/query', {q: info})
	.done(function(html) {
		var html = $(html).filter('.ar')[0];

		switch(tab) {
			case 0:
			_gaq.push(['_trackEvent', 'Søgning', 'Event - synonym', info]);
			opt.title = $(html).find('.head .k').first().text() ? 'Synonymer for \"' + $(html).find('.head .k').first().text().trim().replace(/\d+/g, '') + '\"' : 'Ingen synonymer for \"' + info + '\"';
			var synonymer = $(html).find('.synonym .k');

			if (!synonymer.length) {
				opt.items.push({title: 'Ingen synonymer blev fundet', message: ''});
			}
			$.each(synonymer, function(key, synonym) {
				opt.items.push({title: $(synonym).text().trim().capitalize(), message: ''});
			});
			break;

			case 1:
			_gaq.push(['_trackEvent', 'Søgning', 'Event - antonym', info]);
			opt.title = $(html).find('.head .k').first().text() ? 'Antonymer for \"' + $(html).find('.head .k').first().text().trim().replace(/\d+/g, '') + '\"' : 'Ingen antonymer for \"' + info + '\"';
			var antonymer = $(html).find('.antonym .k');

			if (!antonymer.length) {
				opt.items.push({title: 'Ingen antonymer blev fundet', message: ''});
			}
			$.each(antonymer, function(key, antonym) {
				opt.items.push({title: $(antonym).text().trim().capitalize(), message: ''});
			});
			break
		}
	}).always(function(){
		_gaq.push(['_trackEvent', 'Søgning', 'Event', info]);
		chrome.notifications.create(info, opt);
	});
}
chrome.notifications.onClicked.addListener(function notificationId(nytOrd) {
	chrome.tabs.create({url: 'http://ordnet.dk/ddo/ordbog?query=' + nytOrd}, function tab() {
		_gaq.push(['_trackEvent', 'Søgning', 'Event - link', nytOrd]);
		chrome.notifications.clear(nytOrd);
	});
})
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}