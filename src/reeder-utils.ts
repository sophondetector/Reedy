import { toggleDevOnly } from './dev-only.js';
import { lex, LexedPara } from './lexy.js'

//TODO change this to a state object
var LEXOR_ACTIVE = false;
var LEXOR_TARGET_IDX = 0;
var LEXOR_PARA_COUNT = 0;
var LEXOR_MAX_SENT_IDX = 0;

//TODO move all these into consts
const LEXOR_ON_CLASS = "lexor-on"
const LEXOR_OFF_CLASS = "lexor-off"
const LEXOR_SENTENCE_CLASS = "lexor-sent"

const REEDING_ROOM_CONTENT_SELECTOR = "#reeding-room-content"
const REEDING_ROOM_CONTENT_TITLE_SELECTOR = "#reeding-room-content-title"

//TODO this is dumb remove this
export const REEDING_ROOM_CONTENT = document.querySelector(REEDING_ROOM_CONTENT_SELECTOR)
export const REEDING_ROOM_CONTENT_TITLE = document.querySelector(REEDING_ROOM_CONTENT_TITLE_SELECTOR)

function isBlank(para: LexedPara): boolean {
	for (const sent of para) {
		// if there is one NON-blank sentence, we return false
		if (sent.trim()) return false
	}
	return true
}

// TODO write addToReadingRoom function
export async function initReedingRoom(content: string): Promise<void> {
	console.log(`reeding-room init start`);

	LEXOR_ACTIVE = false
	LEXOR_TARGET_IDX = 0
	LEXOR_MAX_SENT_IDX = 0
	LEXOR_PARA_COUNT = 0

	const contentDiv = document.querySelector(REEDING_ROOM_CONTENT_SELECTOR)
	contentDiv!.innerHTML = ''

	const lexed = lex(content)

	for (const lp of lexed) {
		if (isBlank(lp)) continue

		const newP = makePara()
		contentDiv!.appendChild(newP)
		for (const sent of lp) {
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
			if (LEXOR_ACTIVE) {
				incTarget();
			}
			break;
		case "k":
			if (LEXOR_ACTIVE) {
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
	LEXOR_ACTIVE = !LEXOR_ACTIVE;
	LEXOR_ACTIVE ? lexorOn() : lexorOff();
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
	let ele = document.createElement("span");
	ele.classList.add(LEXOR_SENTENCE_CLASS);
	ele.textContent = sent + " ";
	ele.id = `sent${LEXOR_MAX_SENT_IDX++}`;
	return ele;
}

function makePara(): HTMLParagraphElement {
	let para = document.createElement("p");
	para.classList.add("reading-room-para");
	para.id = `para${LEXOR_PARA_COUNT++}`;
	return para;
}

function decTarget(): void {
	const sdx = LEXOR_TARGET_IDX - 1;
	if (sdx < 0) {
		return;
	}
	setNewTarget(sdx);
}

function incTarget(): void {
	const udx = LEXOR_TARGET_IDX + 1;
	if (udx >= LEXOR_MAX_SENT_IDX) {
		return;
	}
	setNewTarget(udx);
}

function setNewTarget(id: number): void {
	unsetTarget();
	const targSent = getSent(id)
	targSent.classList.add("target");
	LEXOR_TARGET_IDX = id;
	// @ts-ignore
	targSent.scrollIntoViewIfNeeded()
}

function unsetTarget(): void {
	getSent(LEXOR_TARGET_IDX).classList.remove("target");
}

function getSent(id: number): HTMLSpanElement {
	return document.querySelector(`#sent${id}`) as HTMLSpanElement
}

