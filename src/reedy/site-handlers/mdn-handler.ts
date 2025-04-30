import { ReedyHandler } from "./reedy-handler-type"

function mdnElementGetter(): Array<Element> | null {
	let mainContent;

	mainContent = document.querySelector('article')
	if (mainContent) return [mainContent]

	return null
}

export const mdnHandler: ReedyHandler = {
	getReedyElements: mdnElementGetter,
	getScrollableElement: () => undefined
}
