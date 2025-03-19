export function mdnHandler(): Element {
	const mainContent = document.querySelector('article')
	if (!mainContent) {
		throw new Error('mdnHandler: could not find main content!')
	}
	return mainContent
}

