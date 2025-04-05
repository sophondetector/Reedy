import { ReedyHandler } from "./reedy-handler-type"

function mdnElementGetter(): Array<Element> | null {
	const mainContent = document.querySelector('article')
	if (mainContent === null) {
		console.log(`mdnHandler: could not find article element`)
		return null
	}
	return [mainContent]
}

export const mdnHandler: ReedyHandler = {
	getReedyElements: mdnElementGetter,
	getScrollableElement: () => undefined
}
