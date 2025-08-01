async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

const toggle = document.getElementById('reedy-toggle') as HTMLButtonElement
const slider = document.getElementById('opacity-slider') as HTMLInputElement
const colorPicker = document.getElementById('color-picker') as HTMLInputElement

toggle.addEventListener('click', async () => {
	const tab = await getCurrentTab()
	chrome.tabs.sendMessage(tab.id!, "toggle screen", function() {
		console.log("sent message to content.ts in open tab")
	})
})

// TODO FIXME fix "message port was closed before response was sent" error
// TODO add opacity readout to options.html
// TODO save the opacity slider value in localStorage
// and retreive it whenever the page opens
slider.addEventListener("input", async (event) => {
	//@ts-ignore
	const value = event.target.value
	const tab = await getCurrentTab()
	chrome.tabs.sendMessage(tab.id!, `${value}`, function() {
		console.log(`sent screen value ${value} to content.ts in open tab`)
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
		chrome.tabs.sendMessage(tab.id!, "get state", function(state) {
			slider.value = String(state.opacity * 100)
			colorPicker.value = state.hexColor
		})
	})


