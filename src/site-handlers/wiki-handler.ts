export function wikiHandler(): Element {
	const mainContent = document.querySelector('#mw-content-text')
	if (!mainContent) {
		throw new Error('wikiHandler: could not find main content!')
	}
	return mainContent
}

