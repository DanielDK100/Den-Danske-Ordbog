chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		title: chrome.i18n.getMessage("eventSlaaOp"), 
		contexts: ['selection'],
		id: 'context' + 'selection',
	});
});
chrome.contextMenus.onClicked.addListener(klikHandler);
chrome.notifications.onButtonClicked.addListener(knapHandler);
function klikHandler(info, tab) {
	var manifest = chrome.runtime.getManifest();
	var antalOrd = 0;
	var soegetekst = info.selectionText.replace(/\./g, '').replace(/,/g, '').replace(/\//g, ' ');
	$.map((soegetekst).split(' '), function(nytOrd) {
		if (antalOrd < 5) {
			var opt = {
				type: 'basic',
				title: '',
				message: '',
				contextMessage: '',
				iconUrl: manifest.icons['128'],
				buttons: [{title: chrome.i18n.getMessage("eventSynonymerKnap")}, {title: chrome.i18n.getMessage("eventAntonymerKnap")}],
			}
			$.get('http://ws.dsl.dk/ddo/query', {q: nytOrd})
			.done(function(html) {
				var html = $(html).filter('.ar')[0];
				var title = $(html).find('.head .k').first().text();

				if (!title) {
					opt.buttons = [];
				}
				opt.title = title ? title.trim().replace(/\d+/g, '') : chrome.i18n.getMessage("extIngenResultater") + ' \"' + nytOrd + '\"';
				opt.message = $(html).find('.dtrn').first().text().trim();
				opt.contextMessage = $(html).find('.m').first().text() ? $(html).find('.m').first().text().trim() : $(html).find('.pos').first().text().trim();
			}).always(function(){
				_gaq.push(['_trackEvent', 'Søgning', 'Event', nytOrd]);
				chrome.notifications.create(nytOrd, opt);
			});
		}
		antalOrd++;
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
			opt.title = $(html).find('.head .k').first().text() ? chrome.i18n.getMessage("eventSynonymer") + ' \"' + $(html).find('.head .k').first().text().trim().replace(/\d+/g, '') + '\"' : chrome.i18n.getMessage("extIngenResultater") + ' \"' + info + '\"';
			var synonymer = $(html).find('.synonym .k');

			if (!synonymer.length) {
				opt.items.push({title: chrome.i18n.getMessage("eventIngenSynonymer"), message: ''});
			}
			$.each(synonymer, function(key, synonym) {
				opt.items.push({title: $(synonym).text().trim().capitalize(), message: ''});
			});
			break;

			case 1:
			_gaq.push(['_trackEvent', 'Søgning', 'Event - antonym', info]);
			opt.title = $(html).find('.head .k').first().text() ? chrome.i18n.getMessage("eventAntonymer") + '\"' + $(html).find('.head .k').first().text().trim().replace(/\d+/g, '') + '\"' : chrome.i18n.getMessage("extIngenResultater") +' \"' + info + '\"';
			var antonymer = $(html).find('.antonym .k');

			if (!antonymer.length) {
				opt.items.push({title: chrome.i18n.getMessage("eventIngenAntonymer"), message: ''});
			}
			$.each(antonymer, function(key, antonym) {
				opt.items.push({title: $(antonym).text().trim().capitalize(), message: ''});
			});
			break
		}
	}).always(function(){
		_gaq.push(['_trackEvent', 'Søgning', 'Event', info]);
		opt.items = opt.items.filter((items, index, self) => self.findIndex((i) => {return i.title === items.title; }) === index);
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