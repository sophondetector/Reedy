import { LECS } from './consts.js';
import { toggleDevOnly } from './dev-only.js';
import { lex, LexedPara } from './lexy.js'

interface ReedyState {
	active: boolean,
	targetIdx: number,
	paraCount: number,
	maxSentIdx: number,
	reset: () => void,
	log: () => void
}

const STATE: ReedyState = {
	active: false,
	targetIdx: 0,
	paraCount: 0,
	maxSentIdx: 0,
	reset: function() {
		this.active = false
		this.targetIdx = 0
		this.paraCount = 0
		this.maxSentIdx = 0
	},
	log: function() {
		console.log(this)
	}
}

//TODO move all these into consts
const LEXOR_ON_CLASS = "lexor-on"
const LEXOR_OFF_CLASS = "lexor-off"
const LEXOR_SENTENCE_CLASS = "lexor-sent"
const TARGET_CLASS = "target"

function paraIsBlank(para: LexedPara): boolean {
	for (const sent of para) {
		// if there is one NON-blank sentence, we return false
		if (sent.trim()) return false
	}
	return true
}

// TODO write addToReadingRoom function
export async function initReedingRoom(content: string): Promise<void> {
	console.log(`reeding-room init start`);

	lexorOff()
	STATE.reset()

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
				setNewTarget(targetNum)
			})

			newP.appendChild(ss)
		}
	}

	setNewTarget(0)

	console.log(`reeding-room init complete`);
}

export function keypressHandler(e: KeyboardEvent): void {
	// console.log(`keypress handler: ${e.key}`)
	switch (e.key) {
		case "L":
			lexorToggle()
			break;
		case "j":
			if (STATE.active) {
				incTarget();
			}
			break;
		case "k":
			if (STATE.active) {
				decTarget();
			}
			break;
		case "`":
			if (e.ctrlKey) toggleDevOnly()
			break;
		default:
			// console.log(e.key);
			break;
	}
}

export function lexorToggle(): void {
	STATE.active = !STATE.active;
	STATE.active ? lexorOn() : lexorOff();
}

function lexorOn(): void {
	const ele = document.querySelector("body");
	ele!.classList.remove(LEXOR_OFF_CLASS);
	ele!.classList.add(LEXOR_ON_CLASS);
}

function lexorOff(): void {
	const ele = document.querySelector("body");
	ele!.classList.remove(LEXOR_ON_CLASS);
	ele!.classList.add(LEXOR_OFF_CLASS);
}

function makeSentSpan(sent: string): HTMLSpanElement {
	const ele = document.createElement("span");
	ele.classList.add(LEXOR_SENTENCE_CLASS);
	ele.textContent = sent + " ";
	ele.id = `sent${STATE.maxSentIdx++}`;
	return ele;
}

function makePara(): HTMLParagraphElement {
	const para = document.createElement("p");
	para.classList.add("reading-room-para");
	para.id = `para${STATE.paraCount++}`;
	return para;
}

function decTarget(): void {
	if (STATE.targetIdx <= 0) return
	setNewTarget(STATE.targetIdx - 1);
}

function incTarget(): void {
	if (STATE.targetIdx >= STATE.maxSentIdx) return
	setNewTarget(STATE.targetIdx + 1);
}

function setNewTarget(sentIdx: number): void {
	const targSent = idx2Sent(sentIdx)
	if (!targSent) return
	unsetTarget();
	targSent.classList.add(TARGET_CLASS);
	STATE.targetIdx = sentIdx
	// @ts-ignore
	targSent.scrollIntoViewIfNeeded()
}

function unsetTarget(): void {
	const targSent = idx2Sent(STATE.targetIdx)
	if (!targSent) return
	targSent.classList.remove("target");
}

function idx2Sent(sentIdx: number): HTMLSpanElement | undefined {
	const sent = document.querySelector(`#sent${sentIdx}`) as HTMLSpanElement
	if (!sent) {
		console.log(`Reedy ERROR: Could not find sent with index ${sentIdx}`)
		return
	}
	return sent
}

