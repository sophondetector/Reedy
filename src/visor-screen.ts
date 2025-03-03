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
	div.style.zIndex = `100` // some websites are able to override this
	// maybe recurse through and remove all z-index rules?

	div.style.top = `50px` // line-top
	div.style.left = `50px` // line-left
	div.style.width = `50px` // line-right - line-left
	div.style.height = `50px` // line-bttom - line-top
	div.style.boxShadow = `0 0 0 99999px rgba(0, 0, 0, .8)`

	div.id = VISOR_SCREEN_ID

	return div
}

function getVsEle(): HTMLDivElement {
	const vsEle = document.getElementById(VISOR_SCREEN_ID) as HTMLDivElement
	if (!vsEle) {
		throw new Error(`getVsEle: could not find element with id ${VISOR_SCREEN_ID}`)
	}
	return vsEle
}

export function moveVisor(x: number, y: number): void {
	const vsEle = getVsEle()
	vsEle.style.left = `${x}px`
	vsEle.style.top = `${y}px`
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

