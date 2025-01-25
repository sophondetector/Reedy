import { getSentBounds } from "./in-page-lexy.js"

const HANDLER_ACTIVATION = false

function Q(lec: string): Element | null {
	return document.querySelector(lec)
}

function QQ(lec: string): Array<Element> | null {
	return Array.from(document.querySelectorAll(lec))
}

// get selection text and send it back
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
	console.log(`response`)
	console.log(response)
	console.log(`sender`)
	console.log(sender)
	try {
		const selectionText = document.getSelection()!.toString()
		sendResponse({ selectionText })
	} catch (err) {
		console.log('Legis content.js hit an error: ', err)
		sendResponse({ err })
	}
})

function getCurrentDomain(): string {
	return window.location.host
}

function mdnHandler(): string {
	console.log("Legis MDN handler!")
	return Q('article')!.textContent as string
}

function vaticanHandler(): string {
	console.log("Legis vatican handler!")
	return Q('.documento')!.textContent as string
}

function wikiHandler(): string {
	console.log("Legis wiki handler!")
	const paraLec = '#mw-content-text p'
	const paras = QQ(paraLec) as Array<Element>
	let text = ''
	for (let para of paras) {
		text += para.textContent
	}
	return text
}

const DOMAIN_HANDLER_MAP = new Map()
DOMAIN_HANDLER_MAP.set("www.vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("en.wikipedia.org", wikiHandler)
DOMAIN_HANDLER_MAP.set("developer.mozilla.org", mdnHandler)

const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())
const CURRENT_DOMAIN = getCurrentDomain()

if (HANDLER_ACTIVATION) {

	if (SUPPORTED_DOMAINS.includes(CURRENT_DOMAIN)) {
		const handler = DOMAIN_HANDLER_MAP.get(CURRENT_DOMAIN)
		const text = handler()
		const bounds = getSentBounds(text)

		for (let idx = 0; idx < bounds.length; idx++) {
			const sentBound = bounds[idx]
			console.log(`SENT ${idx}: `, text.slice(sentBound[0], sentBound[1]))
		}
	} else {
		console.log(`Legis does not support ${CURRENT_DOMAIN}`)
	}

} else {
	console.log(`Legis site handlers deactivated`)
}

