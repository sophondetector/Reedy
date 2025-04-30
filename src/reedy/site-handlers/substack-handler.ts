import { ReedyHandler } from "./reedy-handler-type"

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

function substackElementGetter(): Array<Element> | null {
	let mainContent;

	mainContent = document.querySelector('article')
	if (mainContent) return [mainContent]

	mainContent = document.querySelector('#entry > div.reader-nav-root.reader2-font-base > div.reader-nav-page')
	if (mainContent) return [mainContent]

	return null
}

export const substackHandler: ReedyHandler = {
	getReedyElements: substackElementGetter,
	getScrollableElement: substackScrollableElement
}
