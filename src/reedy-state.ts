// import { initSents } from "./sent-by-sent"
import { rangeAllContent, setNewTargetRange, getRangeIdx, initLineByLine } from "./line-by-line.js"
import { REEDY_PARAGRAPH_CLASS, REEDER_ON_CLASS, LINE_ON_CLASS, SENT_ON_CLASS, LECS } from './consts.js';

type ReederMode = "sent" | "line"

// const PARA_SPLITTER_REGEX = /\n\s*/gm

let REEDER_MODE: ReederMode = "line"
let REEDER_ACTIVE = false
let PARA_COUNT = 0

/*
* this creates a paragraph element with the proper class
* and also increments the paragraph count
*/
function makePara(): HTMLParagraphElement {
	const para = document.createElement("p");
	para.classList.add(REEDY_PARAGRAPH_CLASS);
	para.id = `para${PARA_COUNT++}`;
	return para;
}

function getContentDiv(): HTMLElement {
	return document.querySelector(LECS.main.mainContent) as HTMLElement
}

function resetContent(): void {
	getContentDiv().innerHTML = ''
}

export async function initContent(contentHTML: string): Promise<void> {
	console.log(`initContent start`)
	const contentDiv = getContentDiv()
	const newContainer = document.createElement('div')
	newContainer.innerHTML = contentHTML
	for (const child of Array.from(newContainer.children)) {
		child.classList.add(REEDY_PARAGRAPH_CLASS)
		child.id = `para${PARA_COUNT++}`
		contentDiv.appendChild(child.cloneNode(true))
	}
	console.log(`initContent done`)
}

export async function initReeder(contentHTML: string): Promise<void> {
	reederOff()
	resetContent()
	await initContent(contentHTML)
	await initLineByLine()
	// await initSents()
}

export function reederOn(): void {
	REEDER_ACTIVE = true
	const body = document.querySelector('body') as HTMLElement
	body.classList.add(REEDER_ON_CLASS);
}

export function reederOff(): void {
	REEDER_ACTIVE = false
	const body = document.querySelector('body') as HTMLElement
	body.classList.remove(REEDER_ON_CLASS);
}

export function reederToggle(): boolean {
	REEDER_ACTIVE = !REEDER_ACTIVE;
	REEDER_ACTIVE ? reederOn() : reederOff();
	return REEDER_ACTIVE
}

export function switchReederMode(): void {
	if (REEDER_MODE === "sent") {
		setLineMode()
		return
	}
	setSentMode()
}

export function reederIsActive(): boolean {
	return REEDER_ACTIVE
}

export function getReederMode(): ReederMode {
	return REEDER_MODE
}

function setLineMode(): void {
	REEDER_MODE = "line"
	const body = document.querySelector('body') as HTMLElement
	body.classList.remove(SENT_ON_CLASS);
	body.classList.add(LINE_ON_CLASS);
	rangeAllContent()
	setNewTargetRange(getRangeIdx())
}

function setSentMode(): void {
	REEDER_MODE = "sent"
	const body = document.querySelector('body') as HTMLElement
	body.classList.remove(LINE_ON_CLASS);
	body.classList.add(SENT_ON_CLASS);
}

export function getParaCount(): number {
	return PARA_COUNT
}

export function setParaCount(count: number): void {
	PARA_COUNT = count
}

export function incParaCount(): number {
	PARA_COUNT++
	return PARA_COUNT
}

