import { DOMAIN_HANDLER_MAP, SUPPORTED_DOMAINS } from "./site-handlers/index.js"
import { eleArray2Ranges } from "./line-by-line.js"
import { visorScreenMove, visorScreenInject, visorScreenStatus, visorScreenToggle } from "./visor-screen.js"

const HANDLER_ACTIVATION = true
const TOP_LEVEL_HOST = getCurrentTopLevelHost()
const RESIZE_DEBOUNCE_MILLIS = 500

let RANGES: Range[] | null = null
let RANGE_IDX: number = 0
let DEBOUNCE_TIMEOUT_ID: undefined | number = undefined
let WIN_WIDTH = window.innerWidth

// TODO make this able to discriminate by subdomain
function getCurrentTopLevelHost(): string {
	return window.location.host.match(/\w+\.\w+$/g)![0]
}

function getMaxHeight(range: Range): number {
	let res = 0
	for (const rect of range.getClientRects()) {
		if (rect.height > res) {
			res = rect.height
		}
	}
	return res
}

// TODO refactor all line by line code into a class
function setRange(idx: number): void {
	if (RANGES === null) {
		throw new Error(`setRange: RANGES is null`)
	}

	const range = RANGES[idx]
	if (range === undefined) {
		throw new Error(`setRange: RANGES[${idx}] is undefined!`)
	}

	const rect = range.getBoundingClientRect()
	const rectHeight = getMaxHeight(range)
	// we do the above because sometimes the "extraneous" rects from the range
	// creation process don't remain with the range

	visorScreenMove(rect.left, rect.top, rect.width, rectHeight)
	console.log(`setRange: done`)
}

function rangeIsVisible(rng: Range): boolean {
	const textNode = rng.startContainer
	const parent = textNode.parentElement
	const isVisible = parent!.checkVisibility()
	return isVisible
}

function incRange(): void {
	if (RANGES === null) {
		throw new Error(`incRange: RANGES is null`)
	}
	// find the next visible range
	for (let newIdx = RANGE_IDX + 1; newIdx < RANGES.length; newIdx++) {
		const iterRange = RANGES[newIdx]
		if (rangeIsVisible(iterRange)) {
			setRange(newIdx)
			RANGE_IDX = newIdx
			console.log(`decRange: range set to range at index ${RANGE_IDX}`)
			return
		}
	}
	console.log(`incRange: no visible ranges after RANGE_IDX ${RANGE_IDX}`)
}

function decRange(): void {
	if (RANGES === null) {
		throw new Error(`decRange: RANGES is null`)
	}
	// find the next visible range
	for (let newIdx = RANGE_IDX - 1; newIdx >= 0; newIdx--) {
		const iterRange = RANGES[newIdx]
		if (rangeIsVisible(iterRange)) {
			setRange(newIdx)
			RANGE_IDX = newIdx
			console.log(`decRange: range set to range at index ${RANGE_IDX}`)
			return
		}
	}
	console.log(`decRange: no visible ranges before RANGE_IDX ${RANGE_IDX}`)
}

// TODO shift + arrow increases/decreases highlit ranges
document.addEventListener('keyup', (event) => {
	switch (event.key) {
		case "l":
			event.altKey && visorScreenToggle()
			break;
		case "ArrowDown":
		case "j":
			visorScreenStatus() && event.altKey && incRange()
			break;
		case "ArrowUp":
		case "k":
			visorScreenStatus() && event.altKey && decRange()
			break;
		default:
			break;
	}
})

// TODO this is buggy; WHY!??!?!
function onResizeCallback(eleArray: Array<Element>): void {
	// if same size -> return
	if (window.innerWidth === WIN_WIDTH) return

	// if bigger window -> go backwards
	// if smaller window -> go forwards

	const prevRange = RANGES![RANGE_IDX]
	const prevNode = prevRange.startContainer
	const prevOffset = prevRange.startOffset

	RANGES = eleArray2Ranges(eleArray)
	const newWidth = window.innerWidth
	const delta = WIN_WIDTH - newWidth
	WIN_WIDTH = newWidth

	// case bigger
	if (delta < 0) {
		for (RANGE_IDX; RANGE_IDX > 0; RANGE_IDX--) {
			const iterRange = RANGES[RANGE_IDX]
			if (iterRange.isPointInRange(prevNode, prevOffset)) {
				setRange(RANGE_IDX)
				return
			}
		}
	}

	// case smaller
	for (RANGE_IDX; RANGE_IDX < RANGES.length; RANGE_IDX++) {
		const iterRange = RANGES[RANGE_IDX]
		if (iterRange.isPointInRange(prevNode, prevOffset)) {
			setRange(RANGE_IDX)
			return
		}
	}
}

// TODO refactor so supported domains are in the manifest
// TODO refactor eleArray2Ranges to async generator to work with very large texts
// TODO alt+click+drag creates a highlight box

if (HANDLER_ACTIVATION) {
	if (SUPPORTED_DOMAINS.includes(TOP_LEVEL_HOST)) {

		const handler = DOMAIN_HANDLER_MAP.get(TOP_LEVEL_HOST)
		const eleArray = handler()
		visorScreenInject()
		RANGES = eleArray2Ranges(eleArray)
		setRange(RANGE_IDX)
		incRange() // this ensures the first range that is set is visible
		decRange()

		// RANGES.forEach(r => {
		// 	console.log(r.toString())
		// })

		window.onresize = () => {
			clearTimeout(DEBOUNCE_TIMEOUT_ID)
			DEBOUNCE_TIMEOUT_ID = setTimeout(
				() => onResizeCallback(eleArray),
				RESIZE_DEBOUNCE_MILLIS) as unknown as number
		}

		console.log(`Reedy init complete`)

	} else {
		console.log(`Reedy does not support ${TOP_LEVEL_HOST}`)
	}
} else {
	console.log(`Reedy site handlers deactivated`)
}
