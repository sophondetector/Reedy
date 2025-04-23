import { ReedyHandler } from "./reedy-handler-type"

export function vaticanElementGetter(): Array<Element> | null {
	const mainContent = document.querySelector('.documento')
	if (!mainContent) {
		console.log(`vaticanElementGetter: could not find mainContent`)
		return null
	}
	return [mainContent]
}

export const vaticanHandler: ReedyHandler = {
	getReedyElements: vaticanElementGetter,
	getScrollableElement: () => undefined
}
