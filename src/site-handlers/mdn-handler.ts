import { ReedyHandler } from "./reedy-handler-type"

function mdnElementGetter(): Array<Element> {
	const mainContent = document.querySelector('article')
	if (mainContent === null) {
		throw new Error(`mdnHandler: could not find article element`)
	}
	return [mainContent]
}

export const mdnHandler: ReedyHandler = {
	getReedyElements: mdnElementGetter,
	getScrollableElement: () => undefined
}
