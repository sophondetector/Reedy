import { ReedyHandler } from "./reedy-handler-type"
import { baseElementGetter } from "./generic-handler"

function wikipediaElementGetter(): Array<Element> | null {
	const mainContent = document.querySelector('#mw-content-text')
	if (!mainContent) {
		console.log(`vaticanElementGetter: could not find mainContent`)
		return null
	}
	const eleArray = baseElementGetter(mainContent)
	return eleArray
}

export const wikipediaHandler: ReedyHandler = {
	getReedyElements: wikipediaElementGetter,
	getScrollableElement: () => undefined
}
