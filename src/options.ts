async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

document.querySelector('#reedy-toggle')!.addEventListener('click', async () => {
	const tab = await getCurrentTab()
	chrome.tabs.sendMessage(tab.id!, "toggle screen", function() {
		console.log("sent message to content.ts in open tab")
	})
})

// TODO add opacity readout to options.html
// TODO save the opacity slider value in localStorage
// and retreive it whenever the page opens
const slider = document.querySelector("#opacity-slider") as HTMLInputElement
slider.addEventListener("change", async (event) => {
	//@ts-ignore
	const value = event.target.value
	const tab = await getCurrentTab()
	chrome.tabs.sendMessage(tab.id!, `${value}`, function() {
		console.log(`sent screen value ${value} to content.ts in open tab`)
	})
})

