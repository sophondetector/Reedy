// get selection text and send it back
// @ts-ignore
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
	try {
		const selectionText = document.getSelection()!.toString()
		sendResponse({ selectionText })
	} catch (err) {
		console.log('Legis content.js hit an error: ', err)
		sendResponse({ err })
	}
})
