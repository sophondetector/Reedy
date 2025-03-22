import { DOMAIN_HANDLER_MAP, SUPPORTED_DOMAINS } from "./site-handlers/index.js"
import { RangeManager } from "./range-manager.js"
import { ReedyScreen } from "./reedy-screen.js"

const HANDLER_ACTIVATION = true
const TOP_LEVEL_HOST = getCurrentTopLevelHost()
const RESIZE_DEBOUNCE_MILLIS = 500

let DEBOUNCE_TIMEOUT_ID: undefined | number = undefined

function getCurrentTopLevelHost(): string {
	return window.location.host.match(/\w+\.\w+$/g)![0]
}

// TODO refactor so supported domains are in the manifest
// TODO alt+click+drag creates a highlight box
// TODO make it so you can click on lines to highlight them
// TODO shift + arrow increases/decreases highlit ranges
document.addEventListener('keyup', (event) => {
	switch (event.key) {
		case "l":
			event.altKey && ReedyScreen.toggle()
			break;
		case "ArrowDown":
		case "j":
			ReedyScreen.isOn() && event.altKey && RangeManager.incRange()
			break;
		case "ArrowUp":
		case "k":
			ReedyScreen.isOn() && event.altKey && RangeManager.decRange()
			break;
		default:
			break;
	}
})

if (HANDLER_ACTIVATION) {
	if (SUPPORTED_DOMAINS.includes(TOP_LEVEL_HOST)) {

		const handler = DOMAIN_HANDLER_MAP.get(TOP_LEVEL_HOST)
		const eleArray = handler()
		ReedyScreen.inject()
		RangeManager.init(eleArray)

		window.onresize = () => {
			clearTimeout(DEBOUNCE_TIMEOUT_ID)
			DEBOUNCE_TIMEOUT_ID = setTimeout(
				() => RangeManager.onResizeCallback(eleArray),
				RESIZE_DEBOUNCE_MILLIS) as unknown as number
		}

		console.log(`Reedy init complete`)

	} else {
		console.log(`Reedy does not support ${TOP_LEVEL_HOST}`)
	}
} else {
	console.log(`Reedy site handlers deactivated`)
}
