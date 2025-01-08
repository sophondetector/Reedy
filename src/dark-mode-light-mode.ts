// dark/light theme module
// adapted from Cockpit source
const DARK_CLASS = "darkTheme"
const SHELL_STYLE_KEY = "shell:style"
const PREFERS_DARK_SCHEME = "(prefers-color-scheme: dark)"
const AUTO_STYLE = "auto"
const DARK_STYLE = "dark"

let LOCAL_STORE;
try {
	LOCAL_STORE = window.localStorage
} catch (e) {
	LOCAL_STORE = window.sessionStorage
	window.console.warn(String(e))
}

const SHELL_STYLE = LOCAL_STORE.getItem(SHELL_STYLE_KEY) || AUTO_STYLE;

function addDarkToDocument() {
	document.documentElement.classList.add(DARK_CLASS)
}

function removeDarkFromDocument() {
	document.documentElement.classList.remove(DARK_CLASS)
}

if (window.matchMedia) {
	if (window.matchMedia(PREFERS_DARK_SCHEME).matches && SHELL_STYLE === AUTO_STYLE || SHELL_STYLE === DARK_STYLE) {
		addDarkToDocument()
	} else {
		removeDarkFromDocument()
	}

	window.matchMedia(PREFERS_DARK_SCHEME).addEventListener("change", e => {
		if (e.matches && SHELL_STYLE === AUTO_STYLE || SHELL_STYLE === DARK_STYLE) {
			addDarkToDocument()
		} else {
			removeDarkFromDocument()
		}
	})
}

