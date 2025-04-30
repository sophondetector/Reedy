import { ReedyHandler } from "./reedy-handler-type"

function getParaAndHeaderEles(): Array<Element> | null {
	const lec = 'p h1 h2 h3 h4 h5'
	const res = document.querySelectorAll(lec)
	if (res.length > 0) {
		console.log("getParaAndHeaderEles: found!")
		return Array.from(res)
	}
	return null
}

function getArticleEle(): HTMLElement | null {
	const article = document.querySelector('article')
	if (article) {
		console.log("getArticleEle: found!")
		return article
	}
	return null
}

function getGenericTextEles(): Array<Element> | null {
	const genericLec = 'h1, h2, h3, p, ol, ul'
	const res = document.querySelectorAll(genericLec)
	if (res.length > 0) {
		console.log('getGenericTextEles: success!')
		return Array(...res)
	}
	return null
}

function getBodyChildWithMostText(): Element | null {
	const candidates = document.querySelectorAll('body > *')
	let winner;
	let maxLen = 0;
	for (const cand of candidates) {
		//@ts-ignore
		if (cand.checkVisibility() && cand.innerText && cand.innerText.length > maxLen) {
			winner = cand
			//@ts-ignore
			maxLen = cand.innerText.length
		}
	}

	if (winner) {
		console.log("getBodyChildWithMostText: found!")
		console.log(winner)
		return winner
	}

	return null
}

export function genericElementGetter(): Array<Element> | null {
	let res: Element | Array<Element> | null = null;

	res = getParaAndHeaderEles()
	if (res) return res

	res = getArticleEle()
	if (res) return [res]

	res = getGenericTextEles()
	if (res) return res

	res = getBodyChildWithMostText()
	if (res) return [res]

	return null

}

export const genericHandler: ReedyHandler = {
	getReedyElements: genericElementGetter,
	getScrollableElement: () => undefined
}
