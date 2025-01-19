import { LECS } from './consts.js'

// let ACTIVE: boolean = false
let LINE_WIDTH: null | number = null
// let TARGET_LINE: null | number = null
// let CACHED_PARA: null | HTMLElement = null

function getLineWidth(): number {
	return document.querySelector(LECS.main.mainContent)!.clientWidth
}

document.addEventListener("DOMContentLoaded", function() {
	LINE_WIDTH = getLineWidth()
})

window.onresize = () => {
	LINE_WIDTH = getLineWidth()
	console.log(`LINE WIDTH: ${LINE_WIDTH}`)
}
