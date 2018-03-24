chrome.runtime.setUninstallURL('https://den-danske-ordbog.danielwinther.dk/afinstallation');
var manifest = chrome.runtime.getManifest();
chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage('eventSlaaOp'), 
        contexts: ['selection'],
        id: 'context' + 'selection',
    });
});

chrome.contextMenus.onClicked.addListener(klikHandler);
function klikHandler(info, tab) {
    var soegetekst = info.selectionText.replace(/\./g, '').replace(/,/g, '').replace(/\//g, ' ');
    $.each((soegetekst).split(' '), function(key, nytOrd) {
        if (key >= 4) {
            return false;
        }
        var opt = {
            type: 'basic',
            title: '',
            message: '',
            contextMessage: '',
            iconUrl: manifest.icons['128'],
        }
        $.get(konfiguration.urlWs, {q: nytOrd})
        .done(function(html) {
            var html = $(html).filter('.ar')[0];
            var title = $(html).find('.head .k').first().text();

            if (!title) {
                opt.buttons = [{title: chrome.i18n.getMessage('eventVisOrdforslag')}];
                chrome.notifications.onButtonClicked.removeListener(synonymAntonym);
                chrome.notifications.onButtonClicked.addListener(visForslag);
            }
            else {
                opt.buttons = [{title: chrome.i18n.getMessage('eventSynonymerKnap')}, {title: chrome.i18n.getMessage('eventAntonymerKnap')}];
                chrome.notifications.onButtonClicked.addListener(synonymAntonym);
                chrome.notifications.onButtonClicked.removeListener(visForslag);
            }
            opt.title = title ? title.trim().replace(/\d+/g, '') : chrome.i18n.getMessage('extIngenResultater') + ' \"' + nytOrd + '\"';
            opt.message = $(html).find('.dtrn').first().text().trim();
            opt.contextMessage = $(html).find('.m').first().text() ? $(html).find('.m').first().text().trim() : $(html).find('.pos').first().text().trim();
        }).always(function() {
            ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Event', eventLabel: nytOrd + ' - ' + tab.url});
            chrome.notifications.create(nytOrd, opt);
        });
    })
}
function synonymAntonym(info, tab) {
    var opt = {
        type: 'list',
        title: '',
        message: '',
        iconUrl: manifest.icons['128'],
        items: [],
    }
    $.get(konfiguration.urlWs, {q: info})
    .done(function(html) {
        var html = $(html).filter('.ar')[0];
        switch(tab) {
            case 0:
            ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Event - synonym', eventLabel: info});
            opt.title = $(html).find('.head .k').first().text() ? chrome.i18n.getMessage('eventSynonymer') + ' \"' + $(html).find('.head .k').first().text().trim().replace(/\d+/g, '') + '\"' : chrome.i18n.getMessage('extIngenResultater') + ' \"' + info + '\"';
            var synonymer = $(html).find('.synonym .k');

            if (!synonymer.length) {
                opt.items.push({title: chrome.i18n.getMessage('eventIngenSynonymer'), message: ''});
            }
            $.each(synonymer, function(key, synonym) {
                opt.items.push({title: $(synonym).text().trim().stortBogstav(), message: ''});
            });
            break;

            case 1:
            ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Event - antonym', eventLabel: info});
            opt.title = $(html).find('.head .k').first().text() ? chrome.i18n.getMessage('eventAntonymer') + '\"' + $(html).find('.head .k').first().text().trim().replace(/\d+/g, '') + '\"' : chrome.i18n.getMessage('extIngenResultater') +' \"' + info + '\"';
            var antonymer = $(html).find('.antonym .k');

            if (!antonymer.length) {
                opt.items.push({title: chrome.i18n.getMessage('eventIngenAntonymer'), message: ''});
            }
            $.each(antonymer, function(key, antonym) {
                opt.items.push({title: $(antonym).text().trim().stortBogstav(), message: ''});
            });
            break;
        }
    }).always(function() {
        ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Event', eventLabel: info});
        opt.items = fjernDuplikationer(opt.items);
        chrome.notifications.create(info, opt);
    });
}
function visForslag(info, tab) {
    chrome.notifications.clear(info);
    $.get(konfiguration.urlWs, {q: info})
    .done(function(ingenMatch) {
        var ingenMatch = $(ingenMatch).filter('.nomatch')[0];
        $.each($(ingenMatch).find('ul li'), function(key, nytOrd) {
            if (key >= 4) {
                return false;
            }
            nytOrd = $(nytOrd).text();
            var opt = {
                type: 'basic',
                title: '',
                message: '',
                contextMessage: '',
                iconUrl: manifest.icons['128'],
            }
            $.get(konfiguration.urlWs, {q: nytOrd})
            .done(function(html) {
                var html = $(html).filter('.ar')[0];
                var title = $(html).find('.head .k').first().text();

                opt.title = title ? title.trim().replace(/\d+/g, '') : chrome.i18n.getMessage('extIngenResultater') + ' \"' + nytOrd + '\"';
                opt.message = $(html).find('.dtrn').first().text().trim();
                opt.contextMessage = $(html).find('.m').first().text() ? $(html).find('.m').first().text().trim() : $(html).find('.pos').first().text().trim();
            }).always(function() {
                ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Event - ordforslag', eventLabel: nytOrd});
                chrome.notifications.create(nytOrd, opt);
            });
        });
    });
}
chrome.notifications.onClicked.addListener(function notificationId(nytOrd) {
    chrome.tabs.create({url: konfiguration.urlDenDanskeOrdbog + nytOrd}, function tab() {
        ga('send', {hitType: 'event', eventCategory: 'Søgning', eventAction: 'Event - link', eventLabel: nytOrd});
        chrome.notifications.clear(nytOrd);
    });
})
String.prototype.stortBogstav = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
function fjernDuplikationer(objekter) {
    var brugteObjekter = {};
    for (var i = objekter.length - 1; i >= 0; i--) {
        var so = JSON.stringify(objekter[i]);
        if (brugteObjekter[so]) {
            objekter.splice(i, 1);

        } else {
            brugteObjekter[so] = true;          
        }
    }
    return objekter;
}