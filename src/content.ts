import { DOMAIN_HANDLER_MAP, SUPPORTED_DOMAINS } from "./site-handlers/index.js"
import { ele2Ranges } from "./line-by-line.js"
import { visorScreenMove, visorScreenInject, visorScreenStatus, visorScreenToggle } from "./visor-screen.js"

const HANDLER_ACTIVATION = true
const CURRENT_DOMAIN = getCurrentTld()

let RANGES: Range[] | null = null
let RANGE_IDX: number = 0

// TODO make this able to discriminate by subdomain
function getCurrentTld(): string {
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

if (HANDLER_ACTIVATION) {
	if (SUPPORTED_DOMAINS.includes(CURRENT_DOMAIN)) {

		const handler = DOMAIN_HANDLER_MAP.get(CURRENT_DOMAIN)
		const mainEle = handler()
		visorScreenInject()
		RANGES = ele2Ranges(mainEle)
		setRange(RANGE_IDX)
		console.log(`Reedy init complete`)

	} else {
		console.log(`Reedy does not support ${CURRENT_DOMAIN}`)
	}
} else {
	console.log(`Reedy site handlers deactivated`)
}
