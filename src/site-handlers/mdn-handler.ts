export function mdnHandler(): Array<Element> | null {
	const mainContent = document.querySelector('article')
	if (mainContent === null) {
		return null
	}
	return [mainContent]
}

