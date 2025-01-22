import { LECS } from "./consts"

const TEXT_NODE_NAME = '#text'
let CACHED_PARA: Node | null = null

function setCachedPara(para: Node): void {
	CACHED_PARA = para.cloneNode(true)
}

function getCachedPara(): Node {
	if (!CACHED_PARA) {
		throw Error('no cached para set!')
	}
	return CACHED_PARA.cloneNode()
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

document.querySelector("#reading-mode-switch")!.addEventListener("click", function() {
	// const p = document.querySelector('p') as HTMLElement
	// const rngs = para2Ranges(p)
	// console.log(`ranges`)
	// rngs.forEach(r => console.log(r.toString()))
	console.log('sent-by-sent click!')
})

// ON INCREMENT
// increment range-idx
// replace doc para with clone of cached para
// surround ranges[rangeIdx] with <highlight></highlight>

window.onresize = () => {
	const mainContent = document.querySelector(LECS.main.mainContent)
	const paras = mainContent!.children
	for (const para of paras) {
		const ranges = para2Ranges(para)
		for (const rng of ranges) {
			console.log(rng.toString())
		}
	}
}
