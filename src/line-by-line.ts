import { LECS, REEDER_EVENT } from "./consts"
import { getCachedContent, setCachedContent } from "./cache"

const TEXT_NODE_NAME = '#text'
const PARA_CLASS = 'reading-room-para'

let RANGES: Array<Range[]> | null = null
let RANGE_IDX: number = 0

export function getRangeIdx(): number {
	return RANGE_IDX
}

function getRange(idx: number): Range {
	return RANGES!.flat()[idx]
}

function getMaxRangeIdx(): number {
	return RANGES!.flat().length - 1
}

export function rangeAllContent(): void {
	RANGES = []
	const mainParas = getMainParas()
	for (let idx = 0; idx < mainParas.length; idx++) {
		const para = mainParas[idx]
		const row = para2Ranges(para)
		RANGES.push(row)
	}
	console.log(`rangeAllContent done`)
}

function restoreCachedPara(paraIdx: number): void {
	const paraId = `#para${paraIdx}`
	const mangled = document.querySelector(paraId)

	if (!mangled) {
		console.error(`cant find mangled para ${paraId}!`)
		return
	}

	const fromCache = getCachedContent()?.querySelector(paraId)

	if (!fromCache) {
		console.error(`cache miss!`)
		return
	}

	mangled.replaceWith(fromCache)
}

function isPara(ele: HTMLElement): boolean {
	return ele.classList.contains(PARA_CLASS)
}

function isSent(ele: HTMLElement | null): boolean {
	if (ele === null) {
		throw new Error('range2Sent null element!')
	}
	if (ele.id.match(/sent\d+/)) return true
	return false
}

/*
	* takes a range and returns the sent element which
* contains the start node of that range
*/
export function range2Sent(rng: Range): HTMLElement | null {
	let ele = rng.startContainer.parentElement as HTMLElement
	while (!isSent(ele)) {
		if (!ele.parentElement) return null
		ele = ele.parentElement
	}
	return ele
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
		if (parent === null) {
			throw new Error('range2Para null parentElement!')
		}
	}
	return parent as HTMLElement
}

function para2Idx(para: HTMLElement): number {
	const numStr = para.id.match(/\d+/)!.toString()
	const num = Number(numStr)
	return num
}

export function setNewTargetRange(idx: number): void {
	if (RANGES === null) {
		console.error('setNewTargetRange: no ranges!')
		return
	}
	const rng = getRange(idx)
	if (rng.startContainer === rng.endContainer) {
		rng.surroundContents(document.createElement('target'))
		return
	}
	const before = rng.startContainer.parentElement as HTMLElement
	const target = document.createElement('target')
	const frag = rng.extractContents()
	target.append(frag)
	before!.insertAdjacentElement("afterend", target)
}

function unsetTargetRange(): void {
	if (RANGES === null) {
		console.error("cant unset target range: null RANGES!")
		return
	}
	const rng = getRange(RANGE_IDX)
	const para = range2Para(rng)
	const idx = para2Idx(para)
	restoreCachedPara(idx)
	rangeAllContent()
	// TODO replace rangeContent with reRangePara
	// reRangePara(para)
}

export function decLine(): void {
	// console.log('dec line!')
	if (RANGES === null) return
	if (RANGE_IDX === 0) return
	unsetTargetRange()
	RANGE_IDX--
	setNewTargetRange(RANGE_IDX)
}

export function incLine(): void {
	// console.log('inc line!')
	if (RANGES === null) return
	if (RANGE_IDX === getMaxRangeIdx()) return
	unsetTargetRange()
	RANGE_IDX++
	setNewTargetRange(RANGE_IDX)
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
	const textNodes = getAllTextNodes(paraEle as Node).filter(
		tn => tn.textContent && tn.textContent.length > 0
	)
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

function getMainParas(): HTMLElement[] {
	// TODO if we are in a Reedy page do this
	// if not get the main para some other page-specific way
	const main = document.querySelector(LECS.main.mainContent)
	const arr = Array.from(main!.children) as HTMLElement[]
	return arr
}

window.onresize = () => {
	// TODO find beginning of current active range
	// somehow end up with active line-range containing that beginning
	rangeAllContent()
}

// TODO have inc and dec only visible when reeding room is on and 
// mode is line-by-line
document.addEventListener(REEDER_EVENT, function() {
	console.log(`getting ready for line by line!`)
	setCachedContent(document.querySelector(LECS.main.mainContent)!)
	rangeAllContent()
	incLine()
	decLine()
})
