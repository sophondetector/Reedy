import * as pdfjsLib from 'pdfjs-dist'
import "pdfjs-dist/build/pdf.worker.mjs"

const GET_PDF_TEXT_OPTS = { includeMarkedContent: false, disableNormalization: false }
const TEST_PDF_FILENAME = "../test-content/assemblywomen.pdf"

export async function loadTestPdfText(): Promise<string> {
	const docProxy: pdfjsLib.PDFDocumentProxy = await pdfjsLib.getDocument(TEST_PDF_FILENAME).promise
	return pdfProxy2Str(docProxy)
}

export async function pdfProxy2Str(pdfProxy: pdfjsLib.PDFDocumentProxy): Promise<string> {
	let res = ''
	for (let pageNum = 1; pageNum <= pdfProxy.numPages; pageNum++) {
		const page = await pdfProxy.getPage(pageNum)
		const text = await page.getTextContent(GET_PDF_TEXT_OPTS)
		for (const ite of text.items) {
			//@ts-ignore
			res += ite.str
			//@ts-ignore
			if (ite.hasEOL) res += '\n'
		}
		res += '\n'
	}
	return res
}

export async function file2PdfProxy(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
	const arrBuff = await file.arrayBuffer()
	return pdfjsLib.getDocument(arrBuff).promise
}
