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

	getRangeManager(): RangeManager {
		const rm = this.RANGE_MANAGER
		if (!rm) {
			throw new Error(`ReedyDirector.getRangeManager: this.RANGE_MANAGER is ${rm}!`)
		}
		return rm
	}

	getElementArray(): Array<Element> {
		const ea = this.ELEMENT_ARRAY
		if (!ea) {
			throw new Error(`ReedyDirector.getElementArray: this.ELEMENT_ARRAY is ${ea}`)
		}
		if (ea.length < 1) {
			throw new Error(`ReedyDirector.getElementArray: this.ELEMENT_ARRAY empty!`)
		}
		return ea
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
		const nextRange = this.getRangeManager().getNextRange()
		if (nextRange === undefined) {
			console.log('ReedyDirector.incRange: could not find next range')
			return
		}
		this.setWindowAroundRange(nextRange)
	}

	decRange(): void {
		const prevRange = this.getRangeManager().getPrevRange()
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

	// TODO substack needs an event listener where the main article element
	// gets a scrollend eventlistener which resets the window around the 
	// current range
	//'#post-viewer > div > div > div.pencraft.pc-display-flex.pc-flexDirection-column.flexGrow-tjePuI.pc-reset.content-cFaSRD > div'
	// ^^^ the element which needs the scroll or scrollend listener attached
	// TODO is there a way I can dynamically determine a "scrollable interior" element?
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

		const rm = this.getRangeManager()

		const prevRange = rm.getCurrentRange()
		const prevNode = prevRange.startContainer
		const prevOffset = prevRange.startOffset

		rm.initRanges(this.getElementArray())
		const newWidth = window.innerWidth
		const delta = WIN_WIDTH - newWidth
		WIN_WIDTH = newWidth

		let rangeIdx = rm.getRangeIdx()
		// if bigger window -> go backwards
		if (delta < 0) {
			for (rangeIdx; rangeIdx > 0; rangeIdx--) {
				const iterRange = rm.rangeIdx2Range(rangeIdx)
				if (iterRange.isPointInRange(prevNode, prevOffset)) {
					this.setWindowAroundRange(iterRange)
					rm.setRangeIdx(rangeIdx)
					return
				}
			}
		}

		// if smaller window -> go forwards
		const rangeLen = rm.getRangesLength()
		for (rangeIdx; rangeIdx < rangeLen; rangeIdx++) {
			const iterRange = rm.rangeIdx2Range(rangeIdx)
			if (iterRange.isPointInRange(prevNode, prevOffset)) {
				this.setWindowAroundRange(iterRange)
				rm.setRangeIdx(rangeIdx)
				return
			}
		}
	}

	static getCurrentTopLevelHost(): string {
		return window.location.host.match(/\w+\.\w+$/g)![0]
	}
}
