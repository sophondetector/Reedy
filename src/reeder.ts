import { reederToggle, switchReederMode } from "./reedy-state.js"
import { initSents } from "./sent-by-sent.js"
import { pdfProxy2Str, file2PdfProxy, pdfUrl2Str } from "./pdf-utils.js"
import { getFileLegacy, readFileLegacy } from "./file-loading-utils.js"
import { LECS, STORAGE_KEYS, TEST_CONTENT_PATHS } from "./consts.js"
import { inc, dec, keypressHandler } from "./reedy-controls.js"
import { getCachedContent } from "./cache.js"

function hideTextInput(): void {
	const textEle = (document.querySelector(LECS.main.reedyInputContainer) as HTMLTextAreaElement)
	textEle.style.display = 'none';
}

function showTextInput(): void {
	const textEle = (document.querySelector(LECS.main.reedyInputContainer) as HTMLTextAreaElement)
	textEle.style.display = 'flex';
}

document.addEventListener("keydown", keypressHandler)

document.addEventListener("DOMContentLoaded", function(): void {
	console.log(`content paths: ${TEST_CONTENT_PATHS}`)
	const selectEle = document.querySelector(LECS.main.testContentList) as HTMLSelectElement;
	TEST_CONTENT_PATHS.forEach((path) => {
		const opt = document.createElement('option')
		const fnRegex = /[\w\.\-]+$/g
		const filename = path.match(fnRegex)!.toString() as string
		opt.setAttribute("value", path)
		opt.innerText = filename
		selectEle.appendChild(opt)
	})
	console.log("test content loaded")
})

document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.local.get([STORAGE_KEYS.legisText], ({ legisText }) => {
		if (legisText) {
			initSents(legisText)
			hideTextInput()
		}
	})
})

// so background.ts knows which tab to send a reopen to
document.addEventListener("DOMContentLoaded", () => {
	chrome.tabs.getCurrent(function(tab) {
		if (tab) {
			chrome.storage.local.set({ legisTabId: tab.id })
			console.log(`Reedy: set legisTabId to ${tab.id}`)
			return
		}
		console.log("Reedy: could not find tab!")
	})
})

document.querySelector(LECS.main.enterBut)?.addEventListener("click", () => {
	console.log("doing reading room")
	const textEle = document.querySelector(LECS.main.reedyInput) as HTMLTextAreaElement
	const text = textEle.value
	initSents(text)
	hideTextInput()
})

document.querySelector(LECS.main.resetBut)!.addEventListener("click", () => {
	console.log("resetting reading room")
	const textEle = (document.querySelector(LECS.main.reedyInput) as HTMLTextAreaElement)
	textEle.value = ''
	const contentEle = (document.querySelector(LECS.main.mainContent) as HTMLDivElement)
	contentEle.innerHTML = ''
	showTextInput()
})

document.querySelector(LECS.main.testContentList)!.addEventListener("input", async () => {
	const selectEle = document.querySelector(LECS.main.testContentList) as HTMLOptionElement
	const contentPath = selectEle.value
	if (contentPath === "Test Files") {
		return;
	}
	console.log(`initting textual reeding-room with ${contentPath}`)
	const fileType = contentPath.match(/\w+$/g)!.toString()
	console.log(`contentPath ${contentPath}`)
	console.log(`fileType ${fileType}`)
	switch (fileType) {
		case "pdf":
			pdfUrl2Str(contentPath)
				.then(initSents)
				.then(hideTextInput)
			break;
		case "txt":
			fetch(contentPath)
				.then(resp => resp.text())
				.then(initSents)
				.then(hideTextInput)
			break;
		default:
			console.log(`unknown filetype ${fileType}`)
			break;
	}
})

document.querySelector(LECS.main.readingModeBut)!.addEventListener("click", reederToggle)

document.querySelector(LECS.main.saveTextBut)!.addEventListener("click", async () => {
	const text = document.querySelector(LECS.main.mainContent)!.innerHTML
	const blob = new Blob([text], { type: 'text/html' });
	const downloadUrl = URL.createObjectURL(blob)
	const downloadOpts = {
		saveAs: true,
		url: downloadUrl,
		filename: `legisFile.html`
	}
	chrome.downloads.download(downloadOpts).then(() => {
		window.URL.revokeObjectURL(downloadUrl)
	})
})

document.querySelector(LECS.main.loadTextBut)!.addEventListener("click", async function() {
	try {
		const file: File = await getFileLegacy() as File
		console.log(`loading ${file.type}`)

		switch (file.type) {
			case "application/pdf":
				file2PdfProxy(file)
					.then(pdfProxy2Str)
					.then(initSents)
					.then(hideTextInput)
					.then(() => console.log("loading pdf done"))
				break;

			case "txt":
				const fileString = await readFileLegacy(file) as string
				initSents(fileString)
					.then(hideTextInput)
					.then(() => console.log("loading text done"))
				break;

			case "html":
			case "xml":
				throw new Error("loading xml/html not implemented")
			// read as reading room filetype 
			// contentEle!.innerHTML = fileString
			// TODO reset stuff
			//hideTextInput()
		}

	} catch (err) {
		console.log(`error loading file: ${err}`)
	} finally {
		console.log(`load button handler finished`)
	}
})

document.querySelector(LECS.main.switchMode)!.addEventListener("click", function() {
	const cached = getCachedContent()
	if (!cached) {
		console.error('cache content is null!')
		return
	}
	document.querySelector(LECS.main.mainContent)?.replaceWith(cached)
	switchReederMode()
})

document.querySelector(LECS.main.forwardBut)!.addEventListener("click", inc)

document.querySelector(LECS.main.backBut)!.addEventListener("click", dec)

// adds text sent to this tab from background.ts to the current text.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
	chrome.storage.local.get([STORAGE_KEYS.legisText], (storage) => {
		const newText = storage.legisText + '\n' + msg
		initSents(newText)
		chrome.storage.local.set({ legisText: newText })
		sendResp()
	})
	console.log(`added text from ${sender}`)
})

