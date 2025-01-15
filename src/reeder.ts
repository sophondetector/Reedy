import { initReedingRoom, keypressHandler, lexorToggle } from "./reeder-utils.js"
import { pdfProxy2Str, file2PdfProxy, pdfUrl2Str } from "./pdf-utils.js"
import { getFileLegacy, readFileLegacy } from "./file-loading-utils.js"
import { LECS, STORAGE_KEYS, TEST_CONTENT_PATHS } from "./consts.js"

function hideTextInput(): void {
	const textEle = (document.querySelector(LECS.main.legisInput) as HTMLTextAreaElement)
	textEle.style.display = 'none';
}

function showTextInput(): void {
	const textEle = (document.querySelector(LECS.main.legisInput) as HTMLTextAreaElement)
	textEle.style.display = 'flex';
}

// TODO update this to keydown
document.addEventListener("keypress", keypressHandler)

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
			initReedingRoom(legisText)
			hideTextInput()
		}
	})
})

// so background.ts knows which tab to send a reopen to
document.addEventListener("DOMContentLoaded", () => {
	chrome.tabs.getCurrent(function(tab) {
		if (tab) {
			chrome.storage.local.set({ legisTabId: tab.id })
			console.log(`Legis: set legisTabId to ${tab.id}`)
			return
		}
		console.log("Legis: could not find tab!")
	})
})

document.querySelector(LECS.main.enterBut)?.addEventListener("click", () => {
	console.log("doing reading room")
	const textEle = (document.querySelector(LECS.main.legisInput) as HTMLTextAreaElement)
	const text = textEle.value
	initReedingRoom(text)
	hideTextInput()
})

document.querySelector(LECS.main.resesBut)!.addEventListener("click", () => {
	console.log("resetting reading room")
	const textEle = (document.querySelector(LECS.main.legisInput) as HTMLTextAreaElement)
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
				.then(initReedingRoom)
				.then(hideTextInput)
			break;
		case "txt":
			fetch(contentPath)
				.then(resp => resp.text())
				.then(initReedingRoom)
				.then(hideTextInput)
			break;
		default:
			console.log(`unknown filetype ${fileType}`)
			break;
	}
})

document.querySelector(LECS.main.readingModeBut)!.addEventListener("click", lexorToggle)

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

		// TODO change this to switch statement
		if (file.type === "application/pdf") {
			file2PdfProxy(file)
				.then(pdfProxy2Str)
				.then(initReedingRoom)
				.then(hideTextInput)
				.then(() => console.log("loading pdf done"))
		}

		if (file.type === "txt") {
			const fileString = await readFileLegacy(file) as string
			initReedingRoom(fileString)
				.then(hideTextInput)
				.then(() => console.log("loading text done"))
		}

		if (file.type === "html" || file.type === "xml") {
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

// adds text sent to this tab from background.ts to the current text.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
	chrome.storage.local.get([STORAGE_KEYS.legisText], (storage) => {
		const newText = storage.legisText + '\n' + msg
		initReedingRoom(newText)
		chrome.storage.local.set({ legisText: newText })
		sendResp()
	})
	console.log(`added text from ${sender}`)
})
