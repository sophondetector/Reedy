import { LECS, REEDER_EVENT } from './consts.js';
import { lexText } from './lexy.js';
import { reederOff } from './reedy-state.js'

const PARA_SPLITTER_REGEX = /\n\s*/gm

const REEDY_PARAGRAPH_CLASS = "reading-room-para"
const REEDY_SENTENCE_CLASS = "reedy-sent"
const TARGET_CLASS = "target"

let SENT_TARGET_IDX = 0
let MAX_SENT_TARGET_IDX = 0
let PARA_COUNT = 0

// TODO instead of using .target class just 
// surround sent with a <target> tag
export function decTargetSent(): void {
	if (SENT_TARGET_IDX <= 0) return
	setNewTargetSent(SENT_TARGET_IDX - 1);
}

export function incTargetSent(): void {
	if (SENT_TARGET_IDX === MAX_SENT_TARGET_IDX) return
	setNewTargetSent(SENT_TARGET_IDX + 1);
}

function resetSentState(): void {
	SENT_TARGET_IDX = 0
	MAX_SENT_TARGET_IDX = 0
	PARA_COUNT = 0
}

function addListenerToSent(sent: HTMLElement): void {
	sent.addEventListener('click', function(event) {
		const targetId = (event.target as HTMLElement).id
		console.log(`sent ${targetId} clicked!`)
		const targetNumStr = targetId.match(/\d+$/)!.toString()
		const targetNum = Number(targetNumStr)
		setNewTargetSent(targetNum)
	})
}

export async function initReeder(content: string): Promise<void> {
	reederOff()
	resetSentState()
	await initContent(content)
	await initSents()
	setNewTargetSent(0)
	document.dispatchEvent(new CustomEvent(REEDER_EVENT))
}

async function initContent(content: string): Promise<void> {
	console.log(`initContent start`)
	const contentDiv = document.querySelector(LECS.main.mainContent) as HTMLElement
	contentDiv.innerHTML = ''
	const paraStrings = content.split(PARA_SPLITTER_REGEX)
	for (const ps of paraStrings) {
		if (!ps.trim()) continue
		const para = makePara()
		para.textContent = ps
		contentDiv.appendChild(para)
	}
	console.log(`initContent done`)
}

// TODO write addSentsToReeder function
async function initSents(): Promise<void> {
	console.log(`initSents start`);
	const mainContent = document.querySelector(LECS.main.mainContent) as HTMLElement
	const paras = mainContent.querySelectorAll(`.${REEDY_PARAGRAPH_CLASS}`)
	for (const para of paras) {
		if (!para.textContent) continue
		const sents = lexText(para.textContent)
		para.textContent = ''

		for (const sent of sents) {
			const sentSpan = makeSentSpan(sent)
			addListenerToSent(sentSpan)
			para.appendChild(sentSpan)
		}

	}

	console.log(`initSents done`);
}

function makeSentSpan(sent: string): HTMLSpanElement {
	const ele = document.createElement("span");
	ele.classList.add(REEDY_SENTENCE_CLASS);
	ele.textContent = sent + " ";
	ele.id = `sent${MAX_SENT_TARGET_IDX++}`;
	return ele;
}

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

function setNewTargetSent(sentIdx: number): void {
	const targSent = idx2Sent(sentIdx)
	if (!targSent) return
	unsetTargetSent();
	targSent.classList.add(TARGET_CLASS);
	SENT_TARGET_IDX = sentIdx
	// @ts-ignore
	targSent.scrollIntoViewIfNeeded()
}

function unsetTargetSent(): void {
	const targets = document.querySelectorAll(`.${TARGET_CLASS}`)
	targets.forEach(target => {
		target.classList.remove(TARGET_CLASS)
	})
}

function idx2Sent(sentIdx: number): HTMLSpanElement | undefined {
	if (sentIdx > MAX_SENT_TARGET_IDX) {
		console.error(`request idx ${sentIdx} exceeds max target idx ${MAX_SENT_TARGET_IDX}`)
		return
	}
	const sent = document.querySelector(`#sent${sentIdx}`) as HTMLSpanElement
	if (!sent) {
		console.error(`Reedy ERROR: Could not find sent with index ${sentIdx}`)
		return
	}
	return sent
}

