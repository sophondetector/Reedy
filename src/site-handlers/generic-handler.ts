import { ReedyHandler } from "./reedy-handler-type"

const GENERIC_REEDY_LEC = 'h1, h2, h3, h4, h5, p, ol, ul'

export function baseElementGetter(root: Element | Document): Array<Element> {
	const qsaResult = root.querySelectorAll(GENERIC_REEDY_LEC)
	if (qsaResult.length < 1) {
		throw new Error(`baseElementGetter: could not find any reedy elements!`)
	}
	const arr = Array.from(qsaResult)
	return arr
}

function genericElementGetter(): Array<Element> {
	return baseElementGetter(document)
}

export const genericHandler: ReedyHandler = {
	getReedyElements: genericElementGetter,
	getScrollableElement: () => undefined
}
