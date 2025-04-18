import { ReedyHandler } from "./reedy-handler-type"

// TODO is it possible to eliminate the p > a elements??
const GENERIC_REEDY_LEC = 'h1, h2, h3, h4, h5, p, a, ol, ul, code'

function filterContainedElements(eleArray: Element[]): Element[] {
	const backCheckLimit = 5
	const res: Element[] = []
	for (let idx = 0; idx < eleArray.length; idx++) {
		let counter = 0
		const ele = eleArray[idx]
		let eleInsideOtherEle = false
		for (let jdx = idx - 1; jdx > 0 && counter < backCheckLimit; jdx--, counter++) {
			const otherEle = eleArray[jdx]
			if (otherEle.contains(ele)) {
				eleInsideOtherEle = true
				break
			}
		}
		if (!eleInsideOtherEle) {
			res.push(ele)
		}
	}
	return res
}

export function baseElementGetter(root: Element | Document): Array<Element> | null {
	const qsaResult = root.querySelectorAll(GENERIC_REEDY_LEC)
	if (qsaResult.length < 1) {
		console.log(`baseElementGetter: could not find any reedy elements!`)
		return null
	}
	const arr = Array.from(qsaResult)
	return filterContainedElements(arr)
}

function genericElementGetter(): Array<Element> | null {
	return baseElementGetter(document)
}

export const genericHandler: ReedyHandler = {
	getReedyElements: genericElementGetter,
	getScrollableElement: () => undefined
}
