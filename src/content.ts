import { getSentEnds } from "./in-page-lexy.js"

function Q(lec: string) {
	return document.querySelector(lec)
}

// function QQ(lec: string) {
// 	return document.querySelectorAll(lec)
// }

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

function wikiHandler(): void {
	console.log("Legis wiki handler!")
}

const DOMAIN_HANDLER_MAP = new Map()
DOMAIN_HANDLER_MAP.set("www.vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("en.wikipedia.org", wikiHandler)
DOMAIN_HANDLER_MAP.set("developer.mozilla.org", mdnHandler)

const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())
const CURRENT_DOMAIN = getCurrentDomain()

function getSentBounds(ends: Array<number>, finalEnd: number): Array<Array<number>> {
	let beg = 0
	let end;
	const res = []
	for (let idx = 0; idx < ends.length; idx++) {
		end = ends[idx] + 1
		res.push([beg, end])
		beg = end + 1
	}
	res.push([beg + 1, finalEnd])
	return res
}

if (SUPPORTED_DOMAINS.includes(CURRENT_DOMAIN)) {
	const handler = DOMAIN_HANDLER_MAP.get(CURRENT_DOMAIN)
	const text = handler()
	const ends = getSentEnds(text)
	const bounds = getSentBounds(ends, text.length)

	for (let idx = 0; idx < bounds.length; idx++) {
		const sentBound = bounds[idx]
		console.log(`SENT ${idx}: `, text.slice(sentBound[0], sentBound[1]))
	}


} else {
	console.log(`Legis does not support ${CURRENT_DOMAIN}`)
}

