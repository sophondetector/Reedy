import { STORAGE_KEYS } from "./consts"

const NEW_TEXT_OPTION_ID = "legisOption"
const ADD_TO_TEXT_OPTION_ID = "legisAdd"

const OPEN_SELECTION_MESSAGE = "Legis: give background.ts the selected text"

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		id: NEW_TEXT_OPTION_ID,
		title: "Open selection as new text in Legis",
		contexts: ["selection"],
	})
	chrome.contextMenus.create({
		id: ADD_TO_TEXT_OPTION_ID,
		title: "Add selection to existing text in Legis",
		contexts: ["selection"],
	})
})


chrome.contextMenus.onClicked.addListener(function(item, tab) {
	if (!tab) return

	switch (item.menuItemId) {
		// background.js -> tab "hey give me your document.selectionText"
		// background.js <- tab "here it is!"
		// background.js *stores in legisText localStorage
		// using resp here gives access to the document object selection api 
		// which retains spacing information
		case NEW_TEXT_OPTION_ID:
			chrome.tabs.sendMessage(tab.id!, OPEN_SELECTION_MESSAGE, function(resp) {
				console.log("opening new Legis text")
				if (resp.err) {
					console.log(`there was an error: ${resp.err}`)
					return
				}
				// TODO open in current Legis tab (if exists)
				chrome.storage.local.set({ legisText: resp.selectionText }).then(() => {
					console.log("opening Legis from context menu...")
					chrome.tabs.create({ url: '../pages/index.html' })
				})
			})
			break;

		case ADD_TO_TEXT_OPTION_ID:
			console.log("background.ts add text!")
			chrome.tabs.sendMessage(tab.id!, OPEN_SELECTION_MESSAGE, async (resp) => {
				if (resp.err) {
					console.log(`Legis: there was an error: ${resp.err}`)
					return
				}
				const respText = resp.selectionText
				console.log(`respText inner ${respText}`)
				chrome.storage.local.get([STORAGE_KEYS.legisTabId], (storage) => {
					const tabId = storage.legisTabId
					chrome.tabs.sendMessage(tabId, respText, () => {
						chrome.tabs.update(tabId, { active: true })
					})
				})
			})
			break;
	}
})


// LEGACY METHOD for reference
// chrome.contextMenus.onClicked.addListener(function(item) {
// 	if (item.menuItemId === NEW_TEXT_OPTION_ID) {
// 		console.log(`storing text: ${item.selectionText}`)
// 		chrome.storage.local.set({ legisText: item.selectionText })
// 		console.log("opening app from context menu...")
// 		chrome.tabs.create({ url: '../public/pages/index.html' })
// 	}
// })

