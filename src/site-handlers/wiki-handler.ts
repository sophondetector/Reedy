export function wikiHandler(): Element {
	// TODO fix bug where it goes to [tools] section
	const mainContent = document.querySelector('#mw-content-text')
	if (!mainContent) {
		throw new Error('wikiHandler: could not find main content!')
	}
	return mainContent
}

