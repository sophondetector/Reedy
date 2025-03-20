import { genericHandler } from "./generic-handler"
// import { mdnHandler } from "./mdn-handler"
// import { substackHandler } from "./substack-handler"
// import { vaticanHandler } from "./vatican-handler"
// import { wikiHandler } from "./wiki-handler"

// TODO refactor so handlers return ranges
export const GENERIC_HANDLER_KEY: string = "GENERIC"

export const DOMAIN_HANDLER_MAP = new Map()

DOMAIN_HANDLER_MAP.set(GENERIC_HANDLER_KEY, genericHandler)
DOMAIN_HANDLER_MAP.set("vatican.va", genericHandler)
DOMAIN_HANDLER_MAP.set("wikipedia.org", genericHandler)
DOMAIN_HANDLER_MAP.set("mozilla.org", genericHandler)
DOMAIN_HANDLER_MAP.set("substack.com", genericHandler)

export const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())

