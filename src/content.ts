import { DOMAIN_HANDLER_MAP, SUPPORTED_DOMAINS } from "./site-handlers/index.js"
import { ele2Ranges } from "./line-by-line.js"
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

// TODO set inc and dec range to skip over nonvisible ranges
function incRange(): void {
	if (RANGES === null) {
		throw new Error(`incRange: RANGES is null`)
	}
	const newIdx = RANGE_IDX + 1
	if (newIdx > RANGES.length - 1) {
		console.log(`incRange: max range idx reached!`)
		return
	}
	setRange(newIdx)
	RANGE_IDX = newIdx
	console.log(`incRange: range set to range at index ${RANGE_IDX}`)
	return
}

function decRange(): void {
	if (RANGES === null) {
		throw new Error(`decRange: RANGES is null`)
	}
	const newIdx = RANGE_IDX - 1
	if (newIdx < 0) {
		console.log(`decRange: min range idx reached!`)
		return
	}
	setRange(newIdx)
	RANGE_IDX = newIdx
	console.log(`decRange: range set to range at index ${RANGE_IDX}`)
	return
}

// TODO shift + arrow increases/decreases highlit ranges
document.addEventListener('keyup', (event) => {
	switch (event.key) {
		case "l":
			event.altKey && visorScreenToggle()
			break;
		case "ArrowRight":
		case "j":
			visorScreenStatus() && incRange()
			break;
		case "ArrowLeft":
		case "k":
			visorScreenStatus() && decRange()
			break;
		default:
			break;
	}
})

// TODO this is buggy; WHY!??!?!
function onResizeCallback(mainEle: Element): void {
	// if same size -> return
	if (window.innerWidth === WIN_WIDTH) return

	// if bigger window -> go backwards
	// if smaller window -> go forwards

	const prevRange = RANGES![RANGE_IDX]
	const prevNode = prevRange.startContainer
	const prevOffset = prevRange.startOffset

	RANGES = ele2Ranges(mainEle)
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
// TODO refactor ele2Ranges to async generator to work with very large texts
// TODO alt+click+drag creates a highlight box

if (HANDLER_ACTIVATION) {
	if (SUPPORTED_DOMAINS.includes(TOP_LEVEL_HOST)) {

		const handler = DOMAIN_HANDLER_MAP.get(TOP_LEVEL_HOST)
		const mainEle = handler()
		visorScreenInject()
		RANGES = ele2Ranges(mainEle)
		setRange(RANGE_IDX)

		window.onresize = () => {
			clearTimeout(DEBOUNCE_TIMEOUT_ID)
			DEBOUNCE_TIMEOUT_ID = setTimeout(
				() => onResizeCallback(mainEle),
				RESIZE_DEBOUNCE_MILLIS) as unknown as number
		}

		console.log(`Reedy init complete`)

	} else {
		console.log(`Reedy does not support ${TOP_LEVEL_HOST}`)
	}
} else {
	console.log(`Reedy site handlers deactivated`)
}
