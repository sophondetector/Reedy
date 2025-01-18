import { LECS } from './consts.js'

let LINE_WIDTH: null | number = null

//@ts-ignore
function getLineWidth(): number {
	const res = document.querySelector(LECS.main.mainContent)!.clientWidth
	return res
}

document.addEventListener("DOMContentLoaded", function() {
	LINE_WIDTH = getLineWidth()
	console.log(LINE_WIDTH)
})

window.onresize = () => {
	LINE_WIDTH = getLineWidth()
	console.log(`LINE WIDTH: ${LINE_WIDTH}`)
}
