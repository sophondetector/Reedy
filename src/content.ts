import { rangePageContent } from "./line-by-line.js"
import { visorScreenMove, visorScreenInject, visorScreenStatus, visorScreenToggle } from "./visor-screen.js"

const HANDLER_ACTIVATION = true

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

function visorInit(): void {
	visorScreenInject()
	console.log(`visorInit: visor init complete`)
}

function getCurrentDomain(): string {
	return window.location.host
}

// TODO move handlers into separate module

function mdnHandler(): Element {
	const mainContent = document.querySelector('article')
	if (!mainContent) {
		throw new Error('mdnHandler: could not find main content!')
	}
	return mainContent
}

function vaticanHandler(): Element {
	const mainContent = document.querySelector('.testo')
	if (!mainContent) {
		throw new Error('vaticalHandler: could not find main content!')
	}
	return mainContent
}

function wikiHandler(): Element {
	// const mainContent = document.querySelector('#mw-content-text')
	// if (!mainContent) {
	// 	throw new Error('wikiHandler: could not find main content!')
	// }
	// return mainContent
	throw new Error('wikiHandler: handler not implemented!')
}

const DOMAIN_HANDLER_MAP = new Map()
DOMAIN_HANDLER_MAP.set("www.vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("en.wikipedia.org", wikiHandler)
DOMAIN_HANDLER_MAP.set("developer.mozilla.org", mdnHandler)

const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())
const CURRENT_DOMAIN = getCurrentDomain()

let RANGES: Range[] | null = null
let RANGE_IDX: number = 0

function setRange(idx: number): void {
	if (RANGES === null) {
		throw new Error(`setRange: RANGES is null`)
	}

	const range = RANGES[idx]
	if (range === undefined) {
		throw new Error(`setRange: RANGES[${idx}] is undefined!`)
	}

	const rect = range.getBoundingClientRect()
	visorScreenMove(rect.left, rect.top, rect.width, rect.height)
	console.log(`setRange: done`)
}

function incRange(): void {
	if (RANGES === null) {
		throw new Error(`incRange: RANGES is null`)
	}
	const newIdx = RANGE_IDX + 1
	if (newIdx > RANGES.length - 1) {
		console.log(`incRange: max range idx reached!`)
		return
	}
	setRange(newIdx)
	RANGE_IDX = newIdx
	console.log(`incRange: range set to range at index ${RANGE_IDX}`)
	return
}

function decRange(): void {
	if (RANGES === null) {
		throw new Error(`decRange: RANGES is null`)
	}
	const newIdx = RANGE_IDX - 1
	if (newIdx < 0) {
		console.log(`decRange: min range idx reached!`)
		return
	}
	setRange(newIdx)
	RANGE_IDX = newIdx
	console.log(`decRange: range set to range at index ${RANGE_IDX}`)
	return
}

document.addEventListener('keyup', (e) => {
	switch (e.key) {
		case "L":
			visorScreenToggle()
			break;
		case "ArrowRight":
		case "j":
			visorScreenStatus() && incRange()
			break;
		case "ArrowLeft":
		case "k":
			visorScreenStatus() && decRange()
			break;
		default:
			break;
	}
})

if (HANDLER_ACTIVATION) {

	if (SUPPORTED_DOMAINS.includes(CURRENT_DOMAIN)) {

		const handler = DOMAIN_HANDLER_MAP.get(CURRENT_DOMAIN)

		const mainElemenet = handler()

		visorInit()

		RANGES = rangePageContent(mainElemenet)
			.filter(range => range.getBoundingClientRect().width > 0)

		setRange(RANGE_IDX)

		console.log(`Reedy init complete`)

	} else {
		console.log(`Reedy does not support ${CURRENT_DOMAIN}`)
	}

} else {
	console.log(`Reedy site handlers deactivated`)
}
