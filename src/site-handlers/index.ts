import { genericHandler } from "./generic-handler"
import { mdnHandler } from "./mdn-handler"
import { substackHandler } from "./substack-handler"
import { vaticanHandler } from "./vatican-handler"
import { wikiHandler } from "./wiki-handler"

// TODO make this able to discriminate by subdomain
const GENERIC_HANDLER_KEY: string = "GENERIC"
const DOMAIN_HANDLER_MAP = new Map()

DOMAIN_HANDLER_MAP.set(GENERIC_HANDLER_KEY, genericHandler)
DOMAIN_HANDLER_MAP.set("vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("wikipedia.org", wikiHandler)
DOMAIN_HANDLER_MAP.set("mozilla.org", mdnHandler)
DOMAIN_HANDLER_MAP.set("substack.com", substackHandler)

const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())

export class HandlerManager {
	static getHandler(): (() => Array<Element>) {

		const topLevelHost = HandlerManager.getTopLevelHost()

		let handler: (() => Array<Element>) | undefined

		if (SUPPORTED_DOMAINS.includes(topLevelHost)) {
			handler = DOMAIN_HANDLER_MAP.get(topLevelHost)
		} else {
			console.log(`HandlerManager.getHandler: ${topLevelHost} not supported; using generic handler`)
			handler = DOMAIN_HANDLER_MAP.get(GENERIC_HANDLER_KEY)
		}

		if (!handler) {
			throw new Error(`HandlerManager.getHandler: could not get handler!`)
		}

		return handler
	}

	static getEleArray(): Array<Element> {
		const handler = HandlerManager.getHandler()
		const ea = handler()
		if (!ea) {
			throw new Error(`HandlerManager.getEleArray: elementArray from handler is ${ea}!`)
		}
		if (ea.length < 1) {
			throw new Error(`HandlerManager.getEleArray: empty element array from handler!`)
		}
		return ea
	}

	static getTopLevelHost(): string {
		return window.location.host.match(/\w+\.\w+$/g)![0]
	}
}
