import { ReedyDirector } from "./reedy/index.js"

const HANDLER_ACTIVATION = true
const TOP_LEVEL_HOST = getCurrentTopLevelHost()
const RESIZE_DEBOUNCE_MILLIS = 500

let DEBOUNCE_TIMEOUT_ID: undefined | number = undefined
let DIRECTOR: ReedyDirector | null = null

function getCurrentTopLevelHost(): string {
	return window.location.host.match(/\w+\.\w+$/g)![0]
}

// TODO refactor so supported domains are in the manifest
// TODO alt+click+drag creates a highlight box
// TODO make it so you can click on lines to highlight them
document.addEventListener('keyup', (event) => {
	if (DIRECTOR === null) return
	switch (event.key) {
		case "l":
			event.altKey && DIRECTOR.toggle()
			break;
		case "ArrowDown":
		case "j":
			if (DIRECTOR.isOn() && event.altKey) {
				// event.shiftKey only works in the case of arrow keys
				// shift + alt + j is handled as capital "J" case below
				if (event.shiftKey) {
					DIRECTOR.shiftRangeDown()
					break
				}
				DIRECTOR.incRange()
			}
			break;
		case "ArrowUp":
		case "k":
			if (DIRECTOR.isOn() && event.altKey) {
				// event.shiftKey only works in the case of arrow keys
				// shift + alt + k is handled as capital "K" case below
				if (event.shiftKey) {
					DIRECTOR.shiftRangeUp()
					break
				}
				DIRECTOR.decRange()
			}
			break;
		case "J":
			if (DIRECTOR.isOn() && event.altKey) {
				DIRECTOR.shiftRangeDown()
			}
			break
		case "K":
			if (DIRECTOR.isOn() && event.altKey) {
				DIRECTOR.shiftRangeUp()
			}
			break
		default:
			break;
	}
})

if (HANDLER_ACTIVATION) {

	DIRECTOR = new ReedyDirector(TOP_LEVEL_HOST)

	window.onresize = () => {
		clearTimeout(DEBOUNCE_TIMEOUT_ID)
		DEBOUNCE_TIMEOUT_ID = setTimeout(
			() => DIRECTOR!.onResizeCallback(),
			RESIZE_DEBOUNCE_MILLIS) as unknown as number
	}

	console.log(`Reedy init complete`)

} else {
	console.log(`Reedy site handlers deactivated`)
}
