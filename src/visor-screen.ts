const VISOR_SCREEN_ID = 'visorScreen'
const VISOR_SCREEN_DISPLAY = 'flex'
const VISOR_SCREEN_BUFFER_RADIUS = 3

//TODO make it so you can click on lines to highlight them
//TODO refactor visorScreen into a class

function visorScreenCreate(): HTMLDivElement {
	// the box itself is transparent
	// and all around it is colored with the "shadow"

	const div = document.createElement('div')

	div.style.display = VISOR_SCREEN_DISPLAY
	div.style.position = `absolute`
	div.style.overflow = `auto`
	div.style.pointerEvents = `none`
	div.style.zIndex = `99999`

	div.style.top = `0px`
	div.style.left = `0px`
	div.style.width = `0px`
	div.style.height = `0px`
	div.style.boxShadow = `0 0 0 99999px rgba(0, 0, 0, .8)`

	div.id = VISOR_SCREEN_ID

	return div
}

function visorScreenGet(): HTMLDivElement {
	const vsEle = document.getElementById(VISOR_SCREEN_ID) as HTMLDivElement
	if (!vsEle) {
		throw new Error(`getVisorScreen: could not find element with id ${VISOR_SCREEN_ID}`)
	}
	return vsEle
}

export function visorScreenMove(x: number, y: number, width: number, height: number): void {
	const vsEle = visorScreenGet()

	const finalX = x + window.scrollX - VISOR_SCREEN_BUFFER_RADIUS
	const finalY = y + window.scrollY - VISOR_SCREEN_BUFFER_RADIUS
	const finalWidth = width + (VISOR_SCREEN_BUFFER_RADIUS * 2)
	const finalHeight = height + (VISOR_SCREEN_BUFFER_RADIUS * 2)

	vsEle.style.left = `${finalX}px`
	vsEle.style.top = `${finalY}px`
	vsEle.style.width = `${finalWidth}px`
	vsEle.style.height = `${finalHeight}px`
}

export function visorScreenInject(): void {
	const vsDiv = visorScreenCreate()
	document.body.appendChild(vsDiv)
	console.log('visorScreenInject: visor screen div injected')
}

export function visorScreenOn(): void {
	const vsDiv = visorScreenGet()
	vsDiv.style.display = VISOR_SCREEN_DISPLAY
	console.log(`Reedy screen turned on!`)
}

export function visorScreenOff(): void {
	const vsDiv = visorScreenGet()
	vsDiv.style.display = 'none'
	console.log(`Reedy screen turned off!`)
}

/*
* if visor screen is on return true
* else return false
*/
export function visorScreenStatus(): boolean {
	const vsEle = visorScreenGet()
	return !(vsEle.style.display === 'none')
}

export function visorScreenToggle(): void {
	if (visorScreenStatus()) {
		visorScreenOff()
		return
	}
	visorScreenOn()
}
