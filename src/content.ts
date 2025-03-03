import { getSentBounds } from "./in-page-reeder.js"
import { moveVisor, visorScreenInject } from "./visor-screen.js"
// import { ele2Lec } from "./ele2Lec.js"

const HANDLER_ACTIVATION = false

// get selection text and send it back
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
	// console.log(`response`)
	// console.log(response)
	// console.log(`sender`)
	// console.log(sender)
	try {
		const selectionText = document.getSelection()!.toString()
		sendResponse({ selectionText })
	} catch (err) {
		console.log('Reedy content.js hit an error: ', err)
		sendResponse({ err })
	}
})

function getCurrentDomain(): string {
	return window.location.host
}

function mdnHandler(): string {
	console.log("Reedy MDN handler!")
	return document.querySelector('article')!.textContent as string
}

function vaticanHandler(): string {
	console.log("Reedy vatican handler!")
	return document.querySelector('.documento')!.textContent as string
}

function wikiHandler(): string {
	console.log("Reedy wiki handler!")
	const paraLec = '#mw-content-text p'
	const paras = Array.from(document.querySelectorAll(paraLec)) as Array<Element>
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
		console.log(`Reedy does not support ${CURRENT_DOMAIN}`)
	}

} else {
	console.log(`Reedy site handlers deactivated`)
}

visorScreenInject()

document.addEventListener('click', (ev) => {
	moveVisor(ev.pageX, ev.pageY)
})

// TEST BLOCK FOR ele2Lec
// const lecs = [
// 	'#content > article > div > p:nth-child(4)',
// 	'#your_first_website_creating_the_content > a',
// 	'#content > article > section:nth-child(4) > div > dl > dd:nth-child(8) > p > a:nth-child(4) > code'
// ]
//
// for (const le of lecs) {
// 	const ele = Q(le) as HTMLElement
// 	const outLec = ele2Lec(ele)
// 	console.log(`outLec: ${outLec}`)
// }

