import { genericHandler } from "./generic-handler"

// TODO substack doesn't work on infinite scroll style site
// TODO substack doesn't work well on logged-in user subscription site
export function substackHandler(): Array<Element> {
	const mainContent = document.querySelector('article')
	const eleArray = genericHandler(mainContent)
	return eleArray
}

