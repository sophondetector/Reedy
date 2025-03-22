import { genericHandler } from "./generic-handler"

export function wikiHandler(): Array<Element> {
	const mainContent = document.querySelector('#mw-content-text')
	const eleArray = genericHandler(mainContent)
	return eleArray
}

