import { ReedyHandler } from "./reedy-handler-type"

function wikipediaElementGetter(): Array<Element> | null {
	let mainContent
	mainContent = document.querySelector('#mw-content-text')
	if (mainContent) return [mainContent]

	mainContent = document.querySelector('#bodyContent')
	if (mainContent) return [mainContent]

	return null
}

export const wikipediaHandler: ReedyHandler = {
	getReedyElements: wikipediaElementGetter,
	getScrollableElement: () => undefined
}
