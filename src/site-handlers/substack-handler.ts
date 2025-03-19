export function substackHandler(): Element {
	const mainContent = document.querySelector('article')
	if (!mainContent) {
		throw new Error('substackHandler: could not find main content!')
	}
	return mainContent
}

