// TODO refactor all of these so instead of throwing
// they return a Array<Element> | undefined

// TODO set official handler type signature

// TODO put each handler into it's own module even if it's short

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
		throw new Error('vaticanHandler: could not find main content!')
	}
	return mainContent
}

function wikiHandler(): Element {
	const mainContent = document.querySelector('#mw-content-text')
	if (!mainContent) {
		throw new Error('wikiHandler: could not find main content!')
	}
	return mainContent
}

function substackHandler(): Element {
	const mainContent = document.querySelector('article')
	if (!mainContent) {
		throw new Error('substackHandler: could not find main content!')
	}
	return mainContent
}

export const DOMAIN_HANDLER_MAP = new Map()
DOMAIN_HANDLER_MAP.set("vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("wikipedia.org", wikiHandler)
DOMAIN_HANDLER_MAP.set("mozilla.org", mdnHandler)
DOMAIN_HANDLER_MAP.set("substack.com", substackHandler)

export const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())

