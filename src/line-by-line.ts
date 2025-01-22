import { LECS } from './consts.js'

// let ACTIVE: boolean = false
let LINE_WIDTH: null | number = null
// let TARGET_LINE: null | number = null
// let CACHED_PARA: null | HTMLElement = null

function getLineWidth(): number {
	return document.querySelector(LECS.main.mainContent)!.clientWidth
}

const TEXT_NODE_NAME = '#text'

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

function getLineRanges(paraEle: HTMLElement): Array<Range> {
	const res = []
	const finalIdx = paraEle.textContent!.length - 1
	const textNodes = getAllTextNodes(paraEle as Node)

	const lens = textNodes.map(tn => tn.textContent!.length)
	const endIdxs = getEndIdxs(lens)

	res.push(new Range())

	let mainIdx = 0
	let nodeIdx = 0
	let begOffset = 0
	let endOffset = 1
	let endIdxIdx = 0

	res[res.length - 1].setStart(textNodes[nodeIdx], begOffset)
	let prevBottom = res[res.length - 1].getBoundingClientRect().bottom

	while (mainIdx < finalIdx) {
		// Q how do we increment the nodeIdx??
		// A everytime the mainIdx crosses an end, increment nodeIdx
		// and reset endOffset to zero
		const curEnd = endIdxs[endIdxIdx]
		if (mainIdx === curEnd) {
			endIdxIdx++
			nodeIdx++
			endOffset = 1
		}
		res[res.length - 1].setEnd(textNodes[nodeIdx], endOffset)
		const bottom = res[res.length - 1].getBoundingClientRect().bottom
		if (bottom > prevBottom) {
			res[res.length - 1].setEnd(textNodes[nodeIdx], endOffset - 1)
			begOffset = endOffset - 1
			const newRange = new Range()
			newRange.setStart(textNodes[nodeIdx], begOffset)
			res.push(newRange)
			prevBottom = bottom
		}
		mainIdx++
		endOffset++
	}

	res[res.length - 1].setEnd(textNodes[textNodes.length - 1], lens[lens.length - 1] - 1)

	return res
}

document.addEventListener("DOMContentLoaded", function() {
	LINE_WIDTH = getLineWidth()
})

document.querySelector("#reading-mode-switch")!.addEventListener("click", function() {
	// const txt = document.querySelector('p')!.textContent
	// console.log(`TEXT CONTENT: ${txt}`)

	const p = document.querySelector('p') as HTMLElement
	const tns = getAllTextNodes(p as Node)
	console.log(`nodes`)
	console.log(tns)

	const rngs = getLineRanges(p)
	console.log(`ranges`)
	console.log(rngs)
	rngs.forEach(r => console.log(r.toString()))

	// console.log('res')
	// console.log(res)
	// const ses = res.map(n => n.textContent)
	// console.log(ses)
})

window.onresize = () => {
	LINE_WIDTH = getLineWidth()
	console.log(`LINE WIDTH: ${LINE_WIDTH}`)
}
