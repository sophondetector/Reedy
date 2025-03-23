import { RangeManager } from "./range-manager";
import { ReedyScreen } from "./reedy-screen";


export class ReedyDirector {

	static init(eleArray: Array<Element>): void {
		ReedyScreen.inject()
		RangeManager.init(eleArray)
		RangeManager.getNextRange()
		const range = RangeManager.getPrevRange()
		if (range === undefined) {
			console.log('ReedyDirector.init: could not get first visible range!')
			return
		}
		ReedyDirector.setWindowAroundRange(range)
	}

	static toggle(): void {
		ReedyScreen.toggle()
	}

	static isOn(): boolean {
		return ReedyScreen.isOn()
	}

	static incRange(): void {
		const nextRange = RangeManager.getNextRange()
		if (nextRange === undefined) {
			console.log('ReedyDirector.incRange: could not find next range')
			return
		}
		ReedyDirector.setWindowAroundRange(nextRange)
	}

	static decRange(): void {
		const prevRange = RangeManager.getPrevRange()
		if (prevRange === undefined) {
			console.log('ReedyDirector.incRange: could not find next range')
			return
		}
		ReedyDirector.setWindowAroundRange(prevRange)
	}

	static shiftRangeUp(): void {
		RangeManager.shiftRangeUp()
	}

	static shiftRangeDown(): void {
		RangeManager.shiftRangeDown()
	}

	static setWindowAroundRange(range: Range): void {
		const rect = range.getBoundingClientRect()
		const rectHeight = RangeManager.getMaxHeight(range)
		// we do the above because sometimes the "extraneous" rects from the range
		// creation process don't remain with the range
		ReedyScreen.moveViewingWindow(rect.left, rect.top, rect.width, rectHeight)
	}

	// TODO this crashes sometimes; WHY!?!?!
	static onResizeCallback(eleArray: Array<Element>): void {
		// if same size -> return
		const prevWidth = RangeManager.getWinWidth()
		if (window.innerWidth === prevWidth) return

		// if bigger window -> go backwards
		// if smaller window -> go forwards

		const prevRange = RangeManager.getCurrentRange()
		const prevNode = prevRange.startContainer
		const prevOffset = prevRange.startOffset

		RangeManager.init(eleArray)
		const newWidth = window.innerWidth
		const delta = prevWidth - newWidth
		RangeManager.setWinWidth(newWidth)

		let rangeIdx = RangeManager.getRangeIdx()
		// case bigger
		if (delta < 0) {
			for (rangeIdx; rangeIdx > 0; rangeIdx--) {
				const iterRange = RangeManager.rangeIdx2Range(rangeIdx)
				if (iterRange.isPointInRange(prevNode, prevOffset)) {
					ReedyDirector.setWindowAroundRange(iterRange)
					RangeManager.setRangeIdx(rangeIdx)
					return
				}
			}
		}

		// case smaller
		const rangeLen = RangeManager.getRangesLength()
		for (rangeIdx; rangeIdx < rangeLen; rangeIdx++) {
			const iterRange = RangeManager.rangeIdx2Range(rangeIdx)
			if (iterRange.isPointInRange(prevNode, prevOffset)) {
				ReedyDirector.setWindowAroundRange(iterRange)
				RangeManager.setRangeIdx(rangeIdx)
				return
			}
		}
	}

}
