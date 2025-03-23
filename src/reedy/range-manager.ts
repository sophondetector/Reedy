const TEXT_NODE_NAME = '#text'

let RANGES: Range[] | null = null
let RANGE_IDX: number = 0
let WIN_WIDTH = window.innerWidth

export class RangeManager {

	static getWinWidth(): number {
		return WIN_WIDTH
	}

	static setWinWidth(newWidth: number): void {
		WIN_WIDTH = newWidth
	}

	static getRangeIdx(): number {
		return RANGE_IDX
	}

	static assignRanges(ranges: Array<Range>): void {
		RANGES = ranges
	}

	static getCurrentRange(): Range {
		return RANGES![RANGE_IDX]
	}

	static rangeIdx2Range(rangeIdx: number): Range {
		return RANGES![rangeIdx]
	}

	static setRangeIdx(rangeIdx: number): void {
		RANGE_IDX = rangeIdx
	}

	static getRangesLength(): number {
		return RANGES!.length
	}

	static init(eleArray: Array<Element>): void {
		RANGES = RangeManager.eleArray2Ranges(eleArray)
		// RangeManager.setRange(RANGE_IDX)
		// this ensures the first range that is set is visible
		// RangeManager.incRange()
		// RangeManager.decRange()
	}

	static getMaxHeight(range: Range): number {
		let res = 0
		for (const rect of range.getClientRects()) {
			if (rect.height > res) {
				res = rect.height
			}
		}
		return res
	}

	// static setRange(idx: number): void {
	// 	if (RANGES === null) {
	// 		throw new Error(`setRange: RANGES is null`)
	// 	}
	// 	const range = RANGES[idx]
	// 	if (range === undefined) {
	// 		throw new Error(`setRange: RANGES[${idx}] is undefined!`)
	// 	}
	// 	console.log(`setRange: done`)
	// }

	static rangeIsVisible(rng: Range): boolean {
		const textNode = rng.startContainer
		const parent = textNode.parentElement
		const isVisible = parent!.checkVisibility()
		return isVisible
	}

	static getNextRange(): Range | undefined {
		if (RANGES === null) {
			throw new Error(`RangeManager.getNextRange: RANGES is null`)
		}
		// find the next visible range
		for (let newIdx = RANGE_IDX + 1; newIdx < RANGES.length; newIdx++) {
			const iterRange = RANGES[newIdx]
			if (RangeManager.rangeIsVisible(iterRange)) {
				// RangeManager.setRange(newIdx)
				RANGE_IDX = newIdx
				console.log(`RangeManager.getNextRange: range set to range at index ${RANGE_IDX}`)
				return iterRange
			}
		}
		console.log(`RangeManger.getNextRange: no visible ranges after RANGE_IDX ${RANGE_IDX}`)
	}

	static getPrevRange(): Range | undefined {
		if (RANGES === null) {
			throw new Error(`RangeManager.getPrevRange: RANGES is null`)
		}
		// find the next visible range
		for (let newIdx = RANGE_IDX - 1; newIdx >= 0; newIdx--) {
			const iterRange = RANGES[newIdx]
			if (RangeManager.rangeIsVisible(iterRange)) {
				RANGE_IDX = newIdx
				console.log(`RangeManager.getPrevRange: range set to range at index ${RANGE_IDX}`)
				return iterRange
			}
		}
		console.log(`RangeManager.getPrevRange: no visible ranges before RANGE_IDX ${RANGE_IDX}`)
	}

	// TODO refactor eleArray2Ranges to async generator to work with very large texts
	static eleArray2Ranges(eleArray: Array<Element>): Array<Range> {
		const res: Array<Range> = []
		for (let idx = 0; idx < eleArray.length; idx++) {
			const ele = eleArray[idx]
			const iterRes = RangeManager.ele2Ranges(ele)
			res.push(...iterRes)
		}
		return res
	}

	static nodeHasRealText(textNode: Node): boolean {
		return textNode.textContent!.trim().length > 0
	}

	static ele2Ranges(ele: Element): Array<Range> {
		const textNodesWithText = RangeManager.getAllTextNodes(ele)
			.filter(RangeManager.nodeHasRealText)
		const ranges = RangeManager.textNodes2Ranges(textNodesWithText)
		return ranges
	}

	static getAllTextNodes(node: Node): Array<Node> {
		const res = []
		if (node.nodeName === TEXT_NODE_NAME) {
			res.push(node)
			return res
		}
		for (const cn of node.childNodes) {
			const iterRes = RangeManager.getAllTextNodes(cn)
			res.push(...iterRes)
		}
		return res
	}

	static getEndIdxs(lens: Array<number>) {
		const ends = []
		let acc = 0
		for (let idx = 0; idx < lens.length; idx++) {
			acc += lens[idx]
			ends.push(acc)
		}
		const res = ends.map(e => e - 1)
		return res
	}

	static getFinalTextIdx(textNodes: Array<Node>): number {
		let res = 0
		for (const tn of textNodes) {
			res += tn.textContent!.length
		}
		res--
		return res
	}

	static textNodes2Ranges(textNodes: Array<Node>): Array<Range> {
		if (textNodes.length < 1) return []

		const incrementThresh = 5
		const res = []
		const finalIdx = RangeManager.getFinalTextIdx(textNodes)
		const lens = textNodes.map(tn => tn.textContent!.length)
		const endIdxs = RangeManager.getEndIdxs(lens)

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

	static shiftRangeDown(): void {
		console.log('shift range down!')
	}

	static shiftRangeUp(): void {
		console.log('shift range up!')
	}

}
