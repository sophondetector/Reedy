import { ReedyScreenState } from "./types";

async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

const toggle = document.getElementById('reedy-toggle') as HTMLButtonElement
const slider = document.getElementById('opacity-slider') as HTMLInputElement
const sliderReadout = document.getElementById('slider-readout') as HTMLInputElement
const colorPicker = document.getElementById('color-picker') as HTMLInputElement

toggle.addEventListener('click', async () => {
	const tab = await getCurrentTab()
	chrome.tabs.sendMessage(tab.id!, "toggle screen", function() {
		console.log("sent message to content.ts in open tab")
	})
})

// TODO FIXME fix "message port was closed before response was sent" error
slider.addEventListener("input", async (event) => {
	//@ts-ignore
	const value = event.target.value
	const tab = await getCurrentTab()
	chrome.tabs.sendMessage(tab.id!, `${value}`, function() {
		sliderReadout.textContent = `${value}%`
		console.log(`sent screen opacity value ${value} to content.ts in open tab`)
	})
})

colorPicker.addEventListener("input", async (event) => {
	//@ts-ignore
	const value = event.target.value
	const tab = await getCurrentTab()
	chrome.tabs.sendMessage(tab.id!, `${value}`, function() {
		console.log(`sent color value ${value} to content.ts in open tab`)
	})
})

getCurrentTab()
	.then(tab => {
		chrome.tabs.sendMessage(tab.id!, "get state", function(state: ReedyScreenState) {
			const opacityPercent = String(state.opacity * 100)
			slider.value = opacityPercent
			sliderReadout.textContent = `${opacityPercent}%`
			colorPicker.value = state.hexColor
		})
	})


