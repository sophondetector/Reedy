import { LECS } from './consts.js';

function hideDevOnly() {
	document.querySelectorAll(LECS.common.devOnly).forEach(ele => {
		//@ts-ignore
		ele.hidden = true
		console.log('Reedy: dev mode OFF')
	})
}

function showDevOnly() {
	document.querySelectorAll(LECS.common.devOnly).forEach(ele => {
		//@ts-ignore
		ele.hidden = false
		console.log('Reedy: dev mode ON')
	})
}

export function toggleDevOnly() {
	const devOnlyEle = document.querySelector(LECS.common.devOnly)
	//@ts-ignore
	devOnlyEle.hidden ? showDevOnly() : hideDevOnly()
}
