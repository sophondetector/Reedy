import { LECS } from "./consts"

const TEXT_NODE_NAME = '#text'

let RANGES: Range[] | null = null
let RANGE_IDX: number = 0
let MAX_IDX: number | null = null
let CACHED_PARAS: HTMLElement[] | null = null

// ON INCREMENT/DECREMENT
// increment range-idx
// replace doc para with clone of cached para
// surround ranges[rangeIdx] with <highlight></highlight>

function restoreCachedPara(paraIdx: number): void {
	if (CACHED_PARAS === null) {
		throw new Error(`no cached paras!`)
	}

	const mangled = document.querySelector(`#para${paraIdx}`) as HTMLElement
	const fromCache = CACHED_PARAS[paraIdx].cloneNode(true)

	if (!fromCache) {
		throw new Error(`cached paras miss for ${paraIdx}`)
	}
	mangled.replaceWith(fromCache)
}

function isPara(ele: HTMLElement | null): boolean {
	if (ele === null) {
		throw new Error('range2Para null parentElement!')
	}
	return ele.classList.contains('reading-room-para')
}

function range2Para(rng: Range): HTMLElement {
	let parent = rng.commonAncestorContainer.parentElement
	while (!isPara(parent)) {
		parent = parent!.parentElement
	}
	return parent as HTMLElement
}

function para2Idx(para: HTMLElement): number {
	const numStr = para.id.match(/\d+/)!.toString()
	const num = Number(numStr)
	return num
}

function incLine(): void {
	console.log('inc line!')
	if (RANGES === null) return
	if (RANGE_IDX === RANGES.length - 1) {
		return
	}

	const oldRng = RANGES[RANGE_IDX]
	const oldPara = range2Para(oldRng)
	const oldParaIdx = para2Idx(oldPara)
	restoreCachedPara(oldParaIdx)

	RANGE_IDX++

	const rng = RANGES[RANGE_IDX]
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
		// and reset endOffset to zero
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

function paras2Ranges(paras: Element[]): Range[] {
	const res = []
	for (const para of paras) {
		res.push(...para2Ranges(para))
	}
	return res
}

function getMainParas(): HTMLElement[] {
	const main = document.querySelector(LECS.main.mainContent)
	const arr = Array.from(main!.children) as HTMLElement[]
	return arr
}

//TODO this needs to happen on mainContent lec being filled
document.querySelector("#cache-paras")!.addEventListener("click", function() {
	CACHED_PARAS = []
	const childParas = Array.from(document.querySelector(LECS.main.mainContent)!.children) as HTMLElement[]
	for (const para of childParas) {
		CACHED_PARAS.push(para.cloneNode(true) as HTMLElement)
	}
	console.log(`para cache done`)
})

//TODO this needs to happen on mainContent lec being filled
document.querySelector("#line-by-line")!.addEventListener("click", function() {
	const paras = getMainParas()
	RANGES = paras2Ranges(paras)
	for (const rng of RANGES) {
		console.log(rng.toString())
	}
})

document.querySelector('#inc-line')!.addEventListener("click", incLine)

window.onresize = () => {
	const mainContent = document.querySelector(LECS.main.mainContent)
	const paras = getMainParas()
	RANGES = paras2Ranges(paras)
	MAX_IDX = RANGES.length
}
