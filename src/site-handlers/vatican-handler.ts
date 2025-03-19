export function vaticanHandler(): Element {
	const mainContent = document.querySelector('.testo')
	if (!mainContent) {
		throw new Error('vaticanHandler: could not find main content!')
	}
	return mainContent
}

