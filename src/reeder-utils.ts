import { LECS, REEDER_EVENT } from './consts.js';
import { lex, LexedPara } from './lexy.js';
import { reederOff } from './reedy-state.js'

const LEXOR_SENTENCE_CLASS = "lexor-sent"
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
	if (SENT_TARGET_IDX >= MAX_SENT_TARGET_IDX) return
	setNewTargetSent(SENT_TARGET_IDX + 1);
}

function resetSentState(): void {
	SENT_TARGET_IDX = 0
	MAX_SENT_TARGET_IDX = 0
	PARA_COUNT = 0
}

function paraIsBlank(para: LexedPara): boolean {
	for (const sent of para) {
		// if there is one NON-blank sentence, we return false
		if (sent.trim()) return false
	}
	return true
}

// TODO write addSentsToReeder function
export async function initSents(content: string): Promise<void> {
	console.log(`Reeder sents init start`);

	reederOff()
	resetSentState()

	const contentDiv = document.querySelector(LECS.main.mainContent)
	contentDiv!.innerHTML = ''

	const lexed = lex(content)

	for (const para of lexed) {
		if (paraIsBlank(para)) continue

		const newP = makePara()
		contentDiv!.appendChild(newP)
		for (const sent of para) {
			const ss = makeSentSpan(sent)

			ss.addEventListener('click', function(event) {
				const targetId = (event.target as HTMLElement).id
				const targetNumStr = targetId.match(/\d+$/)!.toString()
				const targetNum = Number(targetNumStr)
				setNewTargetSent(targetNum)
			})

			newP.appendChild(ss)
		}
	}

	setNewTargetSent(0)

	document.dispatchEvent(new CustomEvent(REEDER_EVENT))

	console.log(`Reeder sents created`);
}

function makeSentSpan(sent: string): HTMLSpanElement {
	const ele = document.createElement("span");
	ele.classList.add(LEXOR_SENTENCE_CLASS);
	ele.textContent = sent + " ";
	ele.id = `sent${MAX_SENT_TARGET_IDX++}`;
	return ele;
}

function makePara(): HTMLParagraphElement {
	const para = document.createElement("p");
	para.classList.add("reading-room-para");
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
	const targSent = idx2Sent(SENT_TARGET_IDX)
	if (!targSent) return
	targSent.classList.remove("target");
}

function idx2Sent(sentIdx: number): HTMLSpanElement | undefined {
	const sent = document.querySelector(`#sent${sentIdx}`) as HTMLSpanElement
	if (!sent) {
		console.error(`Reedy ERROR: Could not find sent with index ${sentIdx}`)
		return
	}
	return sent
}

