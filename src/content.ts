import { ReedyDirector } from "./reedy/index.js"

const RESIZE_DEBOUNCE_MILLIS = 500

let DEBOUNCE_TIMEOUT_ID: undefined | number = undefined
let DIRECTOR: ReedyDirector | null = null

// receives messages from options.ts control-panel
// @ts-ignore
chrome.runtime.onMessage.addListener(function(value: string, sender, sendResponse) {
	try {

		if (value === "toggle screen") {

			DIRECTOR!.toggleScreen()

		} else if (value.match(/\d+/)) {

			if (!DIRECTOR!.isOn()) return
			const valueNum = Number(value)
			DIRECTOR!.setScreenOpacity(valueNum)

		} else {

			console.log(`Reedy content.ts: Unknown message receieved!!`)
			console.log(`message value: ${value}`)
			console.log(`message sender: ${sender}`)
			console.log(`message sendResp: ${sendResponse}`)

		}

	} catch (err) {
		console.error(`ERROR: Error trying to read input from control panel`)
		console.log(err)
	}
})

// TODO refactor so supported domains are in the manifest
// TODO alt+click+drag creates a highlight box
// TODO make it so you can click on lines to highlight them
document.addEventListener('keyup', (event) => {
	if (DIRECTOR === null) return
	switch (event.key) {
		case "l":
			event.altKey && DIRECTOR.toggleScreen()
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


DIRECTOR = new ReedyDirector()
DIRECTOR.toggleScreenOff()

window.onresize = () => {
	clearTimeout(DEBOUNCE_TIMEOUT_ID)
	DEBOUNCE_TIMEOUT_ID = setTimeout(
		() => DIRECTOR!.onResizeCallback(),
		RESIZE_DEBOUNCE_MILLIS) as unknown as number
}

console.log(`Reedy init complete`)

