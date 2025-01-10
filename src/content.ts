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

function getCurrentDomain(): string {
	return window.location.host.match(/\w+\.\w+$/)!.toString()
}

function vaticanHandler(): void {
	console.log("Legis vatican handler!")
}

function wikiHandler(): void {
	console.log("Legis wiki handler!")
}

const DOMAIN_HANDLER_MAP = new Map()
DOMAIN_HANDLER_MAP.set("vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("wikipedia.org", wikiHandler)

const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())
const CURRENT_DOMAIN = getCurrentDomain()

if (SUPPORTED_DOMAINS.includes(CURRENT_DOMAIN)) {
	DOMAIN_HANDLER_MAP.get(CURRENT_DOMAIN)()
} else {
	console.log(`Legis does not support ${CURRENT_DOMAIN}`)
}

