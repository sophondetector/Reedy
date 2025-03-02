const VISOR_SCREEN_ID = 'visorScreen'
const VISOR_SCREEN_DISPLAY = 'flex'

function createVisorScreen(): HTMLDivElement {
	const div = document.createElement('div')

	div.style.display = VISOR_SCREEN_DISPLAY
	div.style.backgroundColor = `rgba(0, 0, 0, 0.6)`
	div.style.position = `fixed` // NOTE: target div must be relative
	div.style.top = `0`
	div.style.left = `0`
	div.style.bottom = `0`
	div.style.right = `0`
	div.style.overflow = `auto`
	div.style.pointerEvents = `none`
	div.style.zIndex = `100`

	div.id = VISOR_SCREEN_ID

	return div
}

export function visorScreenInject(): void {
	const vsDiv = createVisorScreen()
	document.body.appendChild(vsDiv)
	console.log('visor screen div injected')
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

