import { getReederMode, reederToggle, switchReederMode, initReeder } from "./reedy-state.js"
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

function showHelp(): void {
	const helpModal = document.querySelector(LECS.main.helpModal) as HTMLElement
	helpModal.style.display = "flex"
}

function hideHelp(): void {
	const helpModal = document.querySelector(LECS.main.helpModal) as HTMLElement
	helpModal.style.display = "none"
}

document.querySelector(LECS.main.showHelp)!.addEventListener("click", showHelp)

document.querySelector(LECS.main.hideHelp)!.addEventListener("click", hideHelp)

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
	chrome.storage.local.get([STORAGE_KEYS.reedyText], ({ reedyText }) => {
		if (reedyText) {
			initReeder(reedyText)
			hideTextInput()
		}
	})
})

// so background.ts knows which tab to send a reopen to
document.addEventListener("DOMContentLoaded", () => {
	chrome.tabs.getCurrent(function(tab) {
		if (tab) {
			chrome.storage.local.set({ reedyTabId: tab.id })
			console.log(`Reedy: set reedyTabId to ${tab.id}`)
			return
		}
		console.log("Reedy: could not find tab!")
	})
})

document.querySelector(LECS.main.enterBut)?.addEventListener("click", () => {
	console.log("doing reading room")
	const textEle = document.querySelector(LECS.main.reedyInput) as HTMLTextAreaElement
	const text = textEle.value
	initReeder(text)
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
				.then(initReeder)
				.then(hideTextInput)
			break;
		case "txt":
			fetch(contentPath)
				.then(resp => resp.text())
				.then(initReeder)
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
		filename: `reedyFile.html`
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
					.then(initReeder)
					.then(hideTextInput)
					.then(() => console.log("loading pdf done"))
				break;

			case "txt":
				const fileString = await readFileLegacy(file) as string
				initReeder(fileString)
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
	const mode = getReederMode()
	if (mode === "line") {
		document.querySelector(LECS.main.switchMode)!.textContent = "Line Mode"
		return
	}
	document.querySelector(LECS.main.switchMode)!.textContent = "Sentence Mode"
})

document.querySelector(LECS.main.forwardBut)!.addEventListener("click", inc)

document.querySelector(LECS.main.backBut)!.addEventListener("click", dec)

// adds text sent to this tab from background.ts to the current text.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
	chrome.storage.local.get([STORAGE_KEYS.reedyText], (storage) => {
		const newText = storage.reedyText + '\n' + msg
		initReeder(newText)
		chrome.storage.local.set({ reedyText: newText })
		sendResp()
	})
	console.log(`added text from ${sender}`)
})

