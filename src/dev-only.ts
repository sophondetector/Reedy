import { LECS } from './consts.js';

function hideDevOnly() {
	document.querySelectorAll(LECS.common.devOnly).forEach(ele => {
		//@ts-ignore
		ele.hidden = true
	})
}


function showDevOnly() {
	document.querySelectorAll(LECS.common.devOnly).forEach(ele => {
		//@ts-ignore
		ele.hidden = false
	})
}

export function toggleDevOnly() {
	const devOnlyEle = document.querySelector(LECS.common.devOnly)
	//@ts-ignore
	devOnlyEle.hidden ? showDevOnly() : hideDevOnly()
}
