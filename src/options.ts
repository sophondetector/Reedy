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
