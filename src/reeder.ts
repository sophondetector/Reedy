import { initReedingRoom, keypressHandler, lexorToggle } from "./reeder-utils.js"
import { loadTestPdfText, pdfProxy2Str, file2PdfProxy } from "./pdf-utils.js"
import { getFileLegacy, readFileLegacy } from "./file-loading-utils.js"

const TEST_CONTENT_DIR = '../test-content/texts/'
const TEST_CONTENT_PATHS = [
	"mdn.txt",
	"info-theory.txt",
	"nvim-help.txt",
	"quote-probs.txt",
	"many-abreves.txt",
	"prob-sent.txt",
	"father-casey.txt"
]
const INPUT_LEC = '#legis-input'
const ENTER_BUTTON_LEC = '#legis-enter'
const RESET_BUTTON_LEC = '#legis-reset'
const READING_MODE_BUTTON_LEC = '#reading-mode-toggle'
const SAVE_TEXT_BUTTON_LEC = "#save-text"
const LOAD_TEXT_BUTTON_LEC = "#load-text"
const TEST_PDF_LEC = "#test-pdf"
const TEST_CONTENT_SELECTOR_LEC = "#content-select"
const LEXIFIED_CONTENT_LEC = '#reeding-room-content'
const LEGIS_TEXT_STORAGE_KEY = 'legisText'

async function getTestContent(testContent: string): Promise<string> {
	const url = TEST_CONTENT_DIR + testContent
	return await fetch(url).then((resp) => resp.text()).catch((err) => {
		console.log(`error getting ${url}: ${err}`);
		return '';
	})
}

function hideTextInput(): void {
	const textEle = (document.querySelector(INPUT_LEC) as HTMLTextAreaElement)
	textEle.style.display = 'none';
}

function showTextInput(): void {
	const textEle = (document.querySelector(INPUT_LEC) as HTMLTextAreaElement)
	textEle.style.display = 'flex';
}

// TODO update this to keydown
document.addEventListener("keypress", keypressHandler)

document.addEventListener("DOMContentLoaded", function(): void {
	console.log(`content paths: ${TEST_CONTENT_PATHS}`)
	const selectEle = document.querySelector(TEST_CONTENT_SELECTOR_LEC) as HTMLSelectElement;
	TEST_CONTENT_PATHS.forEach((path) => {
		const opt = document.createElement('option')
		opt.setAttribute("value", path)
		opt.innerText = path
		selectEle.appendChild(opt)
	})
	console.log("test content loaded")
})

document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.local.get([LEGIS_TEXT_STORAGE_KEY], ({ legisText }) => {
		if (legisText) {
			initReedingRoom(legisText)
			hideTextInput()
		}
	})
})

document.querySelector(ENTER_BUTTON_LEC)?.addEventListener("click", () => {
	console.log("doing reading room")
	const textEle = (document.querySelector(INPUT_LEC) as HTMLTextAreaElement)
	const text = textEle.value
	initReedingRoom(text)
	hideTextInput()
})

document.querySelector(RESET_BUTTON_LEC)!.addEventListener("click", () => {
	console.log("resetting reading room")
	const textEle = (document.querySelector(INPUT_LEC) as HTMLTextAreaElement)
	textEle.value = ''
	const contentEle = (document.querySelector(LEXIFIED_CONTENT_LEC) as HTMLDivElement)
	contentEle.innerHTML = ''
	showTextInput()
})

document.querySelector(TEST_CONTENT_SELECTOR_LEC)!.addEventListener("input", async () => {
	const selectEle = document.querySelector(TEST_CONTENT_SELECTOR_LEC) as HTMLOptionElement
	const contentPath = selectEle.value
	if (contentPath === "Test Texts") {
		return;
	}
	console.log(`initting reeding-room with text ${contentPath}`)
	getTestContent(contentPath)
		.then(initReedingRoom)
		.then(hideTextInput)
		.then(() => console.log("test content load done"))
})

document.querySelector(READING_MODE_BUTTON_LEC)!.addEventListener("click", lexorToggle)

document.querySelector(SAVE_TEXT_BUTTON_LEC)!.addEventListener("click", async () => {
	const text = document.querySelector(LEXIFIED_CONTENT_LEC)!.innerHTML
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

document.querySelector(LOAD_TEXT_BUTTON_LEC)!.addEventListener("click", async function() {
	// const contentEle = document.querySelector(LEXIFIED_CONTENT_LEC) as HTMLElement
	try {
		const file: File = await getFileLegacy() as File
		console.log(`loading ${file.type}`)

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

document.querySelector(TEST_PDF_LEC)!.addEventListener("click", async function() {
	console.log("pdf test button clicked")
	loadTestPdfText()
		.then(initReedingRoom)
		.then(hideTextInput)
		.then(() => console.log("loading test pdf done"))
})

