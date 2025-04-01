import { ReedyHandler } from "./reedy-handler-type"
import { baseElementGetter } from "./generic-handler"

function wikipediaElementGetter(): Array<Element> {
	const mainContent = document.querySelector('#mw-content-text')
	if (!mainContent) {
		throw new Error(`vaticanElementGetter: could not find mainContent`)
	}
	const eleArray = baseElementGetter(mainContent)
	return eleArray
}

export const wikipediaHandler: ReedyHandler = {
	getReedyElements: wikipediaElementGetter,
	getScrollableElement: () => undefined
}
