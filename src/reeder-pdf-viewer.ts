import * as pdfjsLib from "pdfjs-dist"
import "pdfjs-dist/build/pdf.worker.mjs"

const TEST_PDF_FILENAME = "../test-content/assemblywomen.pdf"
const CANVAS_ID = "the-canvas"
const PAGE_COUNT_ID = "page-count"
const PAGE_NUM_ID = "page-num"
const PREVIOUS_BUTTON_ID = "prev"
const NEXT_BUTTON_ID = "next"
const SCALE = 3
const CANVAS = document.getElementById(CANVAS_ID) as HTMLElement
//@ts-ignore
const CTX = CANVAS.getContext('2d');

let PDF_DOC: null | pdfjsLib.PDFDocumentProxy = null
let PAGE_NUM = 1
let PAGE_RENDERING = false
let PAGE_NUM_PENDING: null | number = null

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num: Number) {
	PAGE_RENDERING = true;
	// Using promise to fetch the page
	(PDF_DOC as pdfjsLib.PDFDocumentProxy).getPage(num as number).then(function(page) {
		var viewport = page.getViewport({ scale: SCALE });
		//@ts-ignore
		CANVAS.height = viewport.height;
		//@ts-ignore
		CANVAS.width = viewport.width;

		// Render PDF page into CANVAS context
		var renderContext = {
			canvasContext: CTX,
			viewport: viewport
		};
		var renderTask = page.render(renderContext);

		// Wait for rendering to finish
		renderTask.promise.then(function() {
			PAGE_RENDERING = false;
			//@ts-ignore
			if (PAGE_NUM_PENDING !== null) {
				// New page rendering is pending
				//@ts-ignore
				renderPage(PAGE_NUM_PENDING);
				PAGE_NUM_PENDING = null;
			}
		});
	});

	// Update page counters
	//@ts-ignore
	document.getElementById(PAGE_NUM_ID).textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finished. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num: number) {
	if (PAGE_RENDERING) {
		PAGE_NUM_PENDING = num;
	} else {
		renderPage(num);
	}
}

/**
 * Displays previous page.
 */
function onPrevPage() {
	if (PAGE_NUM <= 1) {
		return;
	}
	PAGE_NUM--;
	queueRenderPage(PAGE_NUM);
}
//@ts-ignore
document.getElementById(PREVIOUS_BUTTON_ID).addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
	//@ts-ignore
	if (PAGE_NUM >= PDF_DOC.numPages) {
		return;
	}
	PAGE_NUM++;
	queueRenderPage(PAGE_NUM);
}
//@ts-ignore
document.getElementById(NEXT_BUTTON_ID).addEventListener('click', onNextPage);

/**
 * Asynchronously downloads PDF.
 */
//@ts-ignore
pdfjsLib.getDocument(TEST_PDF_FILENAME).promise.then(function(pdfDoc_) {
	PDF_DOC = pdfDoc_;
	//@ts-ignore
	document.getElementById(PAGE_COUNT_ID).textContent = PDF_DOC.numPages;

	// Initial/first page rendering
	renderPage(PAGE_NUM);
});
