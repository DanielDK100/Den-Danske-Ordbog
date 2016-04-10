chrome.runtime.onInstalled.addListener(function() {
	var id = chrome.contextMenus.create({
		title: 'Slå \"%s\" op i ordbogen', 
		contexts:['selection'],
		id: 'context' + 'selection'
	});  
});
chrome.contextMenus.onClicked.addListener(klikHandler);
function klikHandler(info, tab) {
	chrome.tabs.create({ 
		url: 'popup.html#/?soegetekst=' + info.selectionText,
	})
};