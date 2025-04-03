import { genericHandler } from "./generic-handler"
import { mdnHandler } from "./mdn-handler"
import { substackHandler } from "./substack-handler"
import { vaticanHandler } from "./vatican-handler"
import { wikipediaHandler } from "./wiki-handler"
import { ReedyHandler } from "./reedy-handler-type"

// TODO handlers should exit rather than throw if mainContent not found

// TODO make handlers able to discriminate by subdomain
const GENERIC_HANDLER_KEY: string = "GENERIC"
// TODO give this a proper type!
const DOMAIN_HANDLER_MAP: Map<string, ReedyHandler> = new Map()

DOMAIN_HANDLER_MAP.set(GENERIC_HANDLER_KEY, genericHandler)
DOMAIN_HANDLER_MAP.set("vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("wikipedia.org", wikipediaHandler)
DOMAIN_HANDLER_MAP.set("mozilla.org", mdnHandler)
DOMAIN_HANDLER_MAP.set("substack.com", substackHandler)

const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())

export class HandlerManager {
	static getHandler(): ReedyHandler {

		const topLevelHost = HandlerManager.getTopLevelHost()

		let handler: ReedyHandler | undefined

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

	static getEleArray(): Array<Element> | null {
		const handler = HandlerManager.getHandler()
		const ea = handler.getReedyElements()
		if (!ea) {
			console.log(`HandlerManager.getEleArray: elementArray from handler is ${ea}!`)
			return null
		}
		if (ea.length < 1) {
			console.log(`HandlerManager.getEleArray: empty element array from handler!`)
			return null
		}
		return ea
	}

	static getScrollableElement(): Element | undefined {
		const handler = HandlerManager.getHandler()
		return handler.getScrollableElement()
	}

	static getTopLevelHost(): string {
		return window.location.host.match(/\w+\.\w+$/g)![0]
	}
}
