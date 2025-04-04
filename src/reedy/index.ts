import { HandlerManager } from "../site-handlers/index.js"
import { RangeManager } from "./range-manager";
import { ReedyScreen } from "./reedy-screen";

let WIN_WIDTH = window.innerWidth
let NAV_DEBOUNCE: number | undefined = undefined

export class ReedyDirector {
	RANGE_MANAGER: RangeManager | null = null
	ELEMENT_ARRAY: Array<Element> | null = null

	constructor() {
		this.init()
		this.setClickEventListener()
		this.setOnNav()
	}

	init() {
		this.ELEMENT_ARRAY = HandlerManager.getEleArray()
		if (this.ELEMENT_ARRAY === null) {
			console.log('ReedyDirector.init: null element array, exiting early')
			return
		}
		this.RANGE_MANAGER = new RangeManager(this.ELEMENT_ARRAY)
		ReedyScreen.inject()
		this.setScrollableEventListener()
		const range = this.RANGE_MANAGER.getFirstVisibleRange()
		this.setWindowAroundRange(range)
	}

	setOnNav() {
		//TODO replace this with a "milliseconds since last tree manipulation" debounce
		//@ts-ignore
		window.navigation.onnavigatesuccess = () => {
			clearTimeout(NAV_DEBOUNCE)
			NAV_DEBOUNCE = setTimeout(() => {
				console.log('nav succ')
				this.toggleScreenOff()
				this.init()
			}, 500) as unknown as number
		}
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

	// TODO is there a way I can dynamically determine a "scrollable interior" element?
	setScrollableEventListener(): void {
		const scrollEle = HandlerManager.getScrollableElement()
		if (scrollEle === undefined) {
			return
		}
		scrollEle.addEventListener('scroll', () => {
			RangeManager.bind(this) // needed because by default this will refer to the HTMLElement
			const curr = this.getRangeManager().getCurrentRange()
			this.setWindowAroundRange(curr)
		})
		console.log('ReedyDirector: scrollable element event listener set')
	}

	setClickEventListener(): void {
		window.onclick = (event) => {
			if (!this.isOn()) return

			const rm = this.getRangeManager()
			if (rm.RANGES === null) {
				console.log(`ReedyDirector: RangeManager.RANGES is null!`)
				return
			}

			for (let idx = 0; idx < rm.RANGES.length; idx++) {
				const rng = rm.RANGES[idx]
				const rect = rng.getBoundingClientRect()
				if (event.y < rect.bottom && RangeManager.rangeIsVisible(rng)) {
					rm.setRangeIdx(idx)
					this.setWindowAroundRange(rng)
					return
				}
			}

			console.log('ReedyDirector.clickListener: could not find clickable range')
		}
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
}
