import { ReedyHandler } from "./reedy-handler-type"
import { baseElementGetter } from "./generic-handler"

const SCROLLABLE_ELE_LECS = [
	'#post-viewer > div > div > div.pencraft.pc-display-flex.pc-flexDirection-column.flexGrow-tjePuI.pc-reset.content-cFaSRD > div.pencraft.pc-display-flex.pc-flexDirection-column.flexGrow-tjePuI.pc-reset.post-XKrpvd',
	'#post-viewer > div > div > div.pencraft.pc-display-flex.pc-flexDirection-column.flexGrow-tjePuI.pc-reset.content-cFaSRD > div'
]

// TODO event listener for article fetch
// TODO dfs for the first element that satisfies this
function isScrollable(ele: Element): boolean {
	const map = ele.computedStyleMap()
	const overflowY = map.get('overflow-y')
	return (overflowY == 'scroll' || overflowY == 'auto')
}

function substackScrollableElement(): Element | undefined {
	let scrollableEle;
	for (const lec of SCROLLABLE_ELE_LECS) {
		const ele = document.querySelector(lec)
		if (ele && isScrollable(ele)) {
			scrollableEle = ele
			break
		}
	}
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
