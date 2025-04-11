import { ReedyHandler } from "./reedy-handler-type"
import { baseElementGetter } from "./generic-handler"

export function vaticanElementGetter(): Array<Element> | null {
	const mainContent = document.querySelector('.testo')
	if (!mainContent) {
		console.log(`vaticanElementGetter: could not find mainContent`)
		return null
	}
	const eleArray = baseElementGetter(mainContent)
	return eleArray
}

export const vaticanHandler: ReedyHandler = {
	getReedyElements: vaticanElementGetter,
	getScrollableElement: () => undefined
}
