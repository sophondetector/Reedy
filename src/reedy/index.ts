import { GENERIC_HANDLER_KEY, DOMAIN_HANDLER_MAP, SUPPORTED_DOMAINS } from "../site-handlers/index.js"
import { RangeManager } from "./range-manager";
import { ReedyScreen } from "./reedy-screen";

let WIN_WIDTH = window.innerWidth

export class ReedyDirector {
	RANGE_MANAGER: RangeManager | null = null
	ELEMENT_ARRAY: Array<Element> | null = null
	HANDLER: (() => Array<Element>) | null = null
	TOP_LEVEL_HOST: string | null = null

	constructor() {
		this.TOP_LEVEL_HOST = ReedyDirector.getCurrentTopLevelHost()

		// TODO push this logic down into a HandlerManager object
		if (SUPPORTED_DOMAINS.includes(this.TOP_LEVEL_HOST)) {
			this.HANDLER = DOMAIN_HANDLER_MAP.get(this.TOP_LEVEL_HOST)
		} else {
			this.HANDLER = DOMAIN_HANDLER_MAP.get(GENERIC_HANDLER_KEY)
		}

		if (!this.HANDLER) {
			throw new Error(`ReedyDirector.constructor: could not get handler!`)
		}

		this.ELEMENT_ARRAY = this.HANDLER()
		this.RANGE_MANAGER = new RangeManager(this.ELEMENT_ARRAY)
		ReedyScreen.inject()

		const range = this.RANGE_MANAGER.getFirstVisibleRange()
		this.setWindowAroundRange(range)
	}

	setScreenOpacity(opacity: number) {
		if (!this.isOn()) return
		ReedyScreen.setScreenOpacity(opacity)
	}

	toggleScreen(): void {
		ReedyScreen.toggle()
	}

	toggleScreenOn(): void {
		ReedyScreen.turnOn()
	}

	toggleScreenOff(): void {
		ReedyScreen.turnOff()
	}

	isOn(): boolean {
		return ReedyScreen.isOn()
	}

	incRange(): void {
		const nextRange = this.RANGE_MANAGER!.getNextRange()
		if (nextRange === undefined) {
			console.log('ReedyDirector.incRange: could not find next range')
			return
		}
		this.setWindowAroundRange(nextRange)
	}

	decRange(): void {
		const prevRange = this.RANGE_MANAGER!.getPrevRange()
		if (prevRange === undefined) {
			console.log('ReedyDirector.decRange: could not find previous range')
			return
		}
		this.setWindowAroundRange(prevRange)
	}

	shiftRangeUp(): void {
		console.log('shift up!')
	}

	shiftRangeDown(): void {
		console.log('shift down!')
	}

	setWindowAroundRange(range: Range): void {
		const rect = range.getBoundingClientRect()
		const rectHeight = RangeManager.getMaxHeight(range)
		// we do the above because sometimes the "extraneous" rects from the range
		// creation process don't remain with the range
		ReedyScreen.moveViewingWindow(rect.left, rect.top, rect.width, rectHeight)
	}

	// TODO callback for when page changes layout
	// TODO this crashes sometimes; WHY!?!?!
	// TODO on sizing down this will go to the range BEFORE rather than the range we want
	onResizeCallback(): void {
		// if same size -> return
		if (window.innerWidth === WIN_WIDTH) return

		// if bigger window -> go backwards
		// if smaller window -> go forwards

		const prevRange = this.RANGE_MANAGER!.getCurrentRange()
		const prevNode = prevRange.startContainer
		const prevOffset = prevRange.startOffset

		this.RANGE_MANAGER!.reInitRanges(this.ELEMENT_ARRAY!)
		const newWidth = window.innerWidth
		const delta = WIN_WIDTH - newWidth
		WIN_WIDTH = newWidth

		let rangeIdx = this.RANGE_MANAGER!.getRangeIdx()
		// case bigger
		if (delta < 0) {
			for (rangeIdx; rangeIdx > 0; rangeIdx--) {
				const iterRange = this.RANGE_MANAGER!.rangeIdx2Range(rangeIdx)
				if (iterRange.isPointInRange(prevNode, prevOffset)) {
					this.setWindowAroundRange(iterRange)
					this.RANGE_MANAGER!.setRangeIdx(rangeIdx)
					return
				}
			}
		}

		// case smaller
		const rangeLen = this.RANGE_MANAGER!.getRangesLength()
		for (rangeIdx; rangeIdx < rangeLen; rangeIdx++) {
			const iterRange = this.RANGE_MANAGER!.rangeIdx2Range(rangeIdx)
			if (iterRange.isPointInRange(prevNode, prevOffset)) {
				this.setWindowAroundRange(iterRange)
				this.RANGE_MANAGER!.setRangeIdx(rangeIdx)
				return
			}
		}
	}

	static getCurrentTopLevelHost(): string {
		return window.location.host.match(/\w+\.\w+$/g)![0]
	}
}
