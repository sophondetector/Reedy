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

export const DOMAIN_HANDLER_MAP = new Map()
DOMAIN_HANDLER_MAP.set("www.vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("en.wikipedia.org", wikiHandler)
DOMAIN_HANDLER_MAP.set("developer.mozilla.org", mdnHandler)

export const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())

