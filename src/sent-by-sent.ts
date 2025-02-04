import { LECS } from './consts.js';
import { lexText } from './lexy.js';
import { REEDY_PARAGRAPH_CLASS } from './consts.js';
import { setParaCount } from './reedy-state.js';

const REEDY_SENTENCE_CLASS = "reedy-sent"
const TARGET_CLASS = "target"

let SENT_TARGET_IDX = 0
let MAX_SENT_TARGET_IDX = 0

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

export function resetSentState(): void {
	SENT_TARGET_IDX = 0
	MAX_SENT_TARGET_IDX = 0
	setParaCount(0)
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

// TODO write addSentsToReeder function
export async function initSents(): Promise<void> {
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

export function setNewTargetSent(sentIdx: number): void {
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

