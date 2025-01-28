import { incLine, decLine } from './line-by-line.js'
import { reederToggle, reederIsActive, getReederMode } from './reedy-state.js'
import { toggleDevOnly } from './dev-only.js';
import { incTargetSent, decTargetSent } from "./reeder-utils.js"

export function inc(): void {
	if (!reederIsActive) return
	const mode = getReederMode()
	switch (mode) {
		case "sent":
			incTargetSent()
			break;
		case "line":
			incLine()
			break;
		default:
			console.error(`unknown reederMode ${mode}`)
	}
}

export function dec() {
	if (!reederIsActive) return
	const mode = getReederMode()
	switch (mode) {
		case "sent":
			decTargetSent()
			break;
		case "line":
			decLine()
			break;
		default:
			console.error(`unknown reederMode ${mode}`)
	}
}

export function keypressHandler(e: KeyboardEvent): void {
	switch (e.key) {
		case "L":
			reederToggle()
			break;
		case "j":
			if (!reederIsActive()) return
			inc()
			break;
		case "k":
			if (!reederIsActive()) return
			dec()
			break;
		case "`":
			if (e.ctrlKey) toggleDevOnly()
			break;
		default:
			// console.log(e.key);
			break;
	}
}

