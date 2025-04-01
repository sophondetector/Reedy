import { ReedyHandler } from "./reedy-handler-type"
import { baseElementGetter } from "./generic-handler"

export function vaticanElementGetter(): Array<Element> {
	const mainContent = document.querySelector('.testo')
	if (!mainContent) {
		throw new Error(`vaticanElementGetter: could not find mainContent`)
	}
	const eleArray = baseElementGetter(mainContent)
	return eleArray
}

export const vaticanHandler: ReedyHandler = {
	getReedyElements: vaticanElementGetter,
	getScrollableElement: () => undefined
}
