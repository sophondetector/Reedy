import { LECS, REEDER_EVENT } from "./consts"

const TEXT_NODE_NAME = '#text'
const PARA_CLASS = 'reading-room-para'

let RANGES: Range[] | null = null
let RANGE_IDX: number = 0
let MAX_RANGE_IDX: number | null = null
let CACHED_PARAS: HTMLElement[] | null = null

function restoreCachedPara(paraIdx: number): void {
	if (CACHED_PARAS === null) {
		throw new Error(`no cached paras!`)
	}

	const mangled = document.querySelector(`#para${paraIdx}`) as HTMLElement
	const fromCache = CACHED_PARAS[paraIdx].cloneNode(true)

	if (!fromCache) {
		throw new Error(`cached paras miss for #para${paraIdx}`)
	}
	mangled.replaceWith(fromCache)
}

function isPara(ele: HTMLElement | null): boolean {
	if (ele === null) {
		throw new Error('range2Para null parentElement!')
	}
	return ele.classList.contains(PARA_CLASS)
}

function range2Para(rng: Range): HTMLElement {
	// if the range spans two different html elements 
	// then the common ancestor is also an html element (probably the paragraph)
	// if it doesn't then the common ancestor is a textNode
	// we need to make sure it's of the type HTMLElement 
	// before we feed to to the isPara while-loop
	// if parentNode is of type text get the parent element
	// if parentNode is of type Element then just go on
	let parent = rng.commonAncestorContainer
	if (parent.nodeName === TEXT_NODE_NAME) {
		parent = parent.parentElement as HTMLElement
	}
	while (!isPara(parent as HTMLElement)) {
		parent = parent.parentElement as HTMLElement
	}
	return parent as HTMLElement
}

function para2Idx(para: HTMLElement): number {
	const numStr = para.id.match(/\d+/)!.toString()
	const num = Number(numStr)
	return num
}

export function decLine(): void {
	console.log('dec line!')
	if (RANGES === null) return
	if (RANGE_IDX === 0) return

	const oldRng = RANGES[RANGE_IDX]
	const oldPara = range2Para(oldRng)
	const oldParaIdx = para2Idx(oldPara)

	restoreCachedPara(oldParaIdx)
	RANGES = paras2Ranges(getMainParas())
	RANGE_IDX--

	const rng = RANGES[RANGE_IDX]
	if (rng.startContainer !== rng.endContainer) {
		const before = rng.startContainer.parentElement as HTMLElement
		const target = document.createElement('target')
		const frag = rng.extractContents()
		// target.textContent = frag.textContent
		target.append(frag)
		before!.insertAdjacentElement("afterend", target)
		return
	}
	rng.surroundContents(document.createElement('target'))
}

export function incLine(): void {
	console.log('inc line!')
	if (RANGES === null) return
	if (RANGE_IDX === RANGES.length - 1) {
		return
	}

	const oldRng = RANGES[RANGE_IDX]
	const oldPara = range2Para(oldRng)
	const oldParaIdx = para2Idx(oldPara)

	restoreCachedPara(oldParaIdx)
	RANGES = paras2Ranges(getMainParas())
	RANGE_IDX++

	const rng = RANGES[RANGE_IDX]
	if (rng.startContainer !== rng.endContainer) {
		const before = rng.startContainer.parentElement as HTMLElement
		const target = document.createElement('target')
		const frag = rng.extractContents()
		// target.textContent = frag.textContent
		target.append(frag)
		before!.insertAdjacentElement("afterend", target)
		return
	}
	rng.surroundContents(document.createElement('target'))
}

function getAllTextNodes(node: Node): Node[] {
	const res = []
	if (node.nodeName === TEXT_NODE_NAME) {
		res.push(node)
		return res
	}
	for (const cn of node.childNodes) {
		const iterRes = getAllTextNodes(cn)
		res.push(...iterRes)
	}
	return res
}

function getEndIdxs(lens: Array<number>) {
	const ends = []
	let acc = 0
	for (let idx = 0; idx < lens.length; idx++) {
		acc += lens[idx]
		ends.push(acc)
	}
	const res = ends.map(e => e - 1)
	return res
}

function para2Ranges(paraEle: Element): Array<Range> {
	const res = []
	const finalIdx = paraEle.textContent!.length - 1
	const textNodes = getAllTextNodes(paraEle as Node)

	const lens = textNodes.map(tn => tn.textContent!.length)
	const endIdxs = getEndIdxs(lens)

	res.push(new Range())

	// TODO try refactoring so only mainIdx is incremented and 
	// other pointers are derived from mainIdx
	let mainIdx = 0
	let textNodeIdx = 0
	let begOffset = 0
	let endOffset = 1
	let endIdxIdx = 0

	res[res.length - 1].setStart(textNodes[textNodeIdx], begOffset)
	let prevBottom = res[res.length - 1].getBoundingClientRect().bottom

	while (mainIdx < finalIdx) {
		// Q how do we increment the textNodeIdx??
		// A everytime the mainIdx crosses an end, increment textNodeIdx
		// and reset endOffset to one
		const curEnd = endIdxs[endIdxIdx]
		if (mainIdx === curEnd) {
			endIdxIdx++
			textNodeIdx++
			endOffset = 1
		}
		res[res.length - 1].setEnd(textNodes[textNodeIdx], endOffset)
		const bottom = res[res.length - 1].getBoundingClientRect().bottom
		if (bottom > prevBottom) {
			res[res.length - 1].setEnd(textNodes[textNodeIdx], endOffset - 1)
			begOffset = endOffset - 1
			const newRange = new Range()
			newRange.setStart(textNodes[textNodeIdx], begOffset)
			res.push(newRange)
			prevBottom = bottom
		}
		mainIdx++
		endOffset++
	}

	res[res.length - 1].setEnd(textNodes[textNodes.length - 1], lens[lens.length - 1] - 1)

	return res
}

/*
* this returns a set of ranges representing 
* the display-lines of text in a paragraph
*/
function paras2Ranges(paras: Element[]): Range[] {
	const res = []
	for (const para of paras) {
		res.push(...para2Ranges(para))
	}
	return res
}

function getMainParas(): HTMLElement[] {
	// TODO if we are in a Reedy page do this
	// if not get the main para some other page-specific way
	const main = document.querySelector(LECS.main.mainContent)
	const arr = Array.from(main!.children) as HTMLElement[]
	return arr
}

function cacheParas(): void {
	CACHED_PARAS = []
	const paras = getMainParas()
	for (const para of paras) {
		CACHED_PARAS.push(para.cloneNode(true) as HTMLElement)
	}
	console.log(`para cache done`)
}

window.onresize = () => {
	// TODO find beginning of current active range
	// somehow end up with active line-range containing that beginning
	const paras = getMainParas()
	RANGES = paras2Ranges(paras)
	MAX_RANGE_IDX = RANGES.length - 1
}

// TODO have inc and dec only visible when reeding room is on and 
// mode is line-by-line
document.addEventListener(REEDER_EVENT, function() {
	console.log(`getting ready for line by line!`)
	cacheParas()
	const paras = getMainParas()
	RANGES = paras2Ranges(paras)
	incLine()
	decLine()
})
