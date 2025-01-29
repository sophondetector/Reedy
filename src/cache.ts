let CACHED_MAIN_CONTENT: null | Node = null

export function setCachedContent(content: Node): void {
	CACHED_MAIN_CONTENT = content.cloneNode(true)
}

export function getCachedContent(): Element | undefined {
	if (!CACHED_MAIN_CONTENT) {
		console.error(`cached content is null!`)
		return
	}
	return CACHED_MAIN_CONTENT.cloneNode(true) as Element
}
