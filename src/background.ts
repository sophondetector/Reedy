const OPTION_ID = "legisOption"
const OPEN_SELECTION_MESSAGE = "give background.ts the selected text"

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		id: OPTION_ID,
		title: "Open selection in Legis",
		contexts: ["selection"],
	});
})

chrome.contextMenus.onClicked.addListener(function(item, tab) {
	// background.js -> tab "hey give me your document.selectionText"
	// tab -> background.js "here it is!"
	// background.js *stores in legisText localStorage
	// using resp here gives access to the document object selection api 
	// which retains spacing information
	if (tab && item.menuItemId === OPTION_ID) {
		chrome.tabs.sendMessage(tab.id!, OPEN_SELECTION_MESSAGE, function(resp) {
			console.log("sent message to tab")
			if (resp.err) {
				console.log(`there was an error: ${resp.err}`)
				return
			}
			chrome.storage.local.set({ legisText: resp.selectionText }).then(() => {
				console.log("opening app from context menu...")
				chrome.tabs.create({ url: '../public/pages/index.html' })
			})
		})
	}
})

// LEGACY METHOD for reference
// chrome.contextMenus.onClicked.addListener(function(item) {
// 	if (item.menuItemId === OPTION_ID) {
// 		console.log(`storing text: ${item.selectionText}`)
// 		chrome.storage.local.set({ legisText: item.selectionText })
// 		console.log("opening app from context menu...")
// 		chrome.tabs.create({ url: '../public/pages/index.html' })
// 	}
// })

