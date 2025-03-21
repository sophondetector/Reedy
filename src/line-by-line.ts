const TEXT_NODE_NAME = '#text'


function nodeHasRealText(textNode: Node): boolean {
	return textNode.textContent!.trim().length > 0
}

export function eleArray2Ranges(eleArray: Array<Element>): Array<Range> {
	const res: Array<Range> = []
	for (let idx = 0; idx < eleArray.length; idx++) {
		const ele = eleArray[idx]
		const iterRes = ele2Ranges(ele)
		res.push(...iterRes)
	}
	return res
}

function ele2Ranges(ele: Element): Array<Range> {
	const textNodesWithText = getAllTextNodes(ele)
		.filter(nodeHasRealText)
	const ranges = textNodes2Ranges(textNodesWithText)
	return ranges
}

function getAllTextNodes(node: Node): Array<Node> {
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

function getFinalTextIdx(textNodes: Array<Node>): number {
	let res = 0
	for (const tn of textNodes) {
		res += tn.textContent!.length
	}
	res--
	return res
}

function textNodes2Ranges(textNodes: Array<Node>): Array<Range> {
	if (textNodes.length < 1) return []

	const incrementThresh = 5
	const res = []
	const finalIdx = getFinalTextIdx(textNodes)
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

		if (bottom - prevBottom > incrementThresh) {
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

	res[res.length - 1].setEnd(textNodes[textNodes.length - 1], lens[lens.length - 1])

	return res
}
