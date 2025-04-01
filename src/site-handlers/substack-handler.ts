import { ReedyHandler } from "./reedy-handler-type"
import { baseElementGetter } from "./generic-handler"

// TODO write get substack scrollable element
// TODO substack needs an event listener where the main article element
// gets a scrollend eventlistener which resets the window around the 
// current range
//'#post-viewer > div > div > div.pencraft.pc-display-flex.pc-flexDirection-column.flexGrow-tjePuI.pc-reset.content-cFaSRD > div'
// ^^^ the element which needs the scroll or scrollend listener attached

function substackScrollableElement(): Element | undefined {
	const scrollableLec = '#post-viewer > div > div > div.pencraft.pc-display-flex.pc-flexDirection-column.flexGrow-tjePuI.pc-reset.content-cFaSRD > div'
	const scrollableEle = document.querySelector(scrollableLec)
	if (!scrollableEle) {
		console.log('substackScrollableElement: could not find scrollable element')
		return undefined
	}
	return scrollableEle
}

function substackElementGetter(): Array<Element> {
	const mainContent = document.querySelector('article')
	if (!mainContent) {
		throw new Error(`substackElementGetter: could not find mainContent`)
	}
	const eleArray = baseElementGetter(mainContent)
	return eleArray
}

export const substackHandler: ReedyHandler = {
	getReedyElements: substackElementGetter,
	getScrollableElement: substackScrollableElement
}
