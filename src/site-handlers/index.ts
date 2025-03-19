import { mdnHandler } from "./mdn-handler"
import { substackHandler } from "./substack-handler"
import { vaticanHandler } from "./vatican-handler"
import { wikiHandler } from "./wiki-handler"

// TODO refactor so handlers return ranges

export const DOMAIN_HANDLER_MAP = new Map()
DOMAIN_HANDLER_MAP.set("vatican.va", vaticanHandler)
DOMAIN_HANDLER_MAP.set("wikipedia.org", wikiHandler)
DOMAIN_HANDLER_MAP.set("mozilla.org", mdnHandler)
DOMAIN_HANDLER_MAP.set("substack.com", substackHandler)

export const SUPPORTED_DOMAINS = Array.from(DOMAIN_HANDLER_MAP.keys())

