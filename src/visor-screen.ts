const VISOR_SCREEN_ID = 'visorScreen'
const VISOR_SCREEN_DISPLAY = 'flex'

function createVisorScreen(): HTMLDivElement {
	// the box itself is transparent
	// and all around it is colored with the "shadow"

	const div = document.createElement('div')

	div.style.display = VISOR_SCREEN_DISPLAY
	div.style.position = `absolute` // NOTE: target div must be relative
	div.style.overflow = `auto`
	div.style.pointerEvents = `none`
	div.style.zIndex = `99999` // some websites are able to override this
	// maybe recurse through and remove all z-index rules?

	div.style.top = `0px` // line-top
	div.style.left = `0px` // line-left
	div.style.width = `0px` // line-right - line-left
	div.style.height = `0px` // line-bttom - line-top
	div.style.boxShadow = `0 0 0 99999px rgba(0, 0, 0, .8)`

	div.id = VISOR_SCREEN_ID

	return div
}

function getVisorScreen(): HTMLDivElement {
	const vsEle = document.getElementById(VISOR_SCREEN_ID) as HTMLDivElement
	if (!vsEle) {
		throw new Error(`getVsEle: could not find element with id ${VISOR_SCREEN_ID}`)
	}
	return vsEle
}

export function visorScreenMove(x: number, y: number, width: number, height: number): void {
	const vsEle = getVisorScreen()
	const finalX = x + window.scrollX
	const finalY = y + window.scrollY
	vsEle.style.left = `${finalX}px`
	vsEle.style.top = `${finalY}px`
	vsEle.style.width = `${width}px`
	vsEle.style.height = `${height}px`
}

export function visorScreenInject(): void {
	const vsDiv = createVisorScreen()
	document.body.appendChild(vsDiv)
	console.log('visorScreenInject: visor screen div injected')
}

export function visorScreenOn(): void {
	const vsDiv = document.getElementById(VISOR_SCREEN_ID)
	if (!vsDiv) {
		console.log(`visorScreenOn: Reedy screen not found!`)
		return
	}
	vsDiv.style.display = VISOR_SCREEN_DISPLAY
	console.log(`Reedy screen turned on!`)
}

export function visorScreenOff(): void {
	const vsDiv = document.getElementById(VISOR_SCREEN_ID)
	if (!vsDiv) {
		console.log(`visorScreenOff: Reedy screen not found!`)
		return
	}
	vsDiv.style.display = 'none'
	console.log(`Reedy screen turned off!`)
}

/*
* if visor screen is on return true
* else return false
*/
export function visorScreenStatus(): boolean {
	const vsEle = getVisorScreen()
	return !(vsEle.style.display === 'none')
}

export function visorScreenToggle(): void {
	if (visorScreenStatus()) {
		visorScreenOff()
		return
	}
	visorScreenOn()
}
