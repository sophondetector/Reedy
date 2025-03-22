import { genericHandler } from "./generic-handler"

export function substackHandler(): Array<Element> {
	const mainContent = document.querySelector('article')
	const eleArray = genericHandler(mainContent)
	return eleArray
}

