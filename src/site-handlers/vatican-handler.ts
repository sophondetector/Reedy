import { genericHandler } from "./generic-handler"

export function vaticanHandler(): Array<Element> {
	const mainContent = document.querySelector('.testo')
	const eleArray = genericHandler(mainContent)
	return eleArray
}

