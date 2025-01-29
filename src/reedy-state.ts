import { rangeContent, setNewTargetRange, getRangeIdx } from "./line-by-line.js"

type ReederMode = "sent" | "line"

const REEDER_ON_CLASS = "reeder-on"
const SENT_ON_CLASS = "sent-on"
const LINE_ON_CLASS = "line-on"

let REEDER_MODE: ReederMode = "line"
let REEDER_ACTIVE = false

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
	rangeContent()
	setNewTargetRange(getRangeIdx())
}

function setSentMode(): void {
	REEDER_MODE = "sent"
	const body = document.querySelector('body') as HTMLElement
	body.classList.remove(LINE_ON_CLASS);
	body.classList.add(SENT_ON_CLASS);
}

