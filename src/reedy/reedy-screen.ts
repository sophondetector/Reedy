const REEDY_SCREEN_ID = 'reedyScreen'
const REEDY_SCREEN_DISPLAY = 'flex'
const REEDY_SCREEN_BUFFER_RADIUS = 3

// TODO turn this into an instance method
export class ReedyScreen {
	static create(): HTMLDivElement {
		// the box itself is transparent
		// and all around it is colored with the "shadow"

		const div = document.createElement('div')

		div.style.display = REEDY_SCREEN_DISPLAY
		div.style.position = `absolute`
		div.style.overflow = `auto`
		div.style.pointerEvents = `none`
		div.style.zIndex = `99999`

		div.style.top = `0px`
		div.style.left = `0px`
		div.style.width = `0px`
		div.style.height = `0px`
		div.style.boxShadow = `0 0 0 99999px rgba(0, 0, 0, .8)`

		div.id = REEDY_SCREEN_ID

		return div
	}

	static getScreenEle(): HTMLDivElement {
		const screenEle = document.getElementById(REEDY_SCREEN_ID)
		if (!screenEle) {
			throw new Error(`ReedyScreen.getScreenEle: could not find element with id ${REEDY_SCREEN_ID}`)
		}
		return screenEle as HTMLDivElement
	}

	static setScreenOpacity(opacity: number): void {
		// console.log(`ReedyScreen.setScreenOpacity: opacity value ${opacity} received!`)
		const div = ReedyScreen.getScreenEle()
		div.style.boxShadow = `0 0 0 99999px rgba(0, 0, 0, ${opacity / 100})`
	}

	static moveViewingWindow(x: number, y: number, width: number, height: number): void {
		const screenEle = ReedyScreen.getScreenEle()

		const finalX = x + window.scrollX - REEDY_SCREEN_BUFFER_RADIUS
		const finalY = y + window.scrollY - REEDY_SCREEN_BUFFER_RADIUS
		const finalWidth = width + (REEDY_SCREEN_BUFFER_RADIUS * 2)
		const finalHeight = height + (REEDY_SCREEN_BUFFER_RADIUS * 2)

		screenEle.style.left = `${finalX}px`
		screenEle.style.top = `${finalY}px`
		screenEle.style.width = `${finalWidth}px`
		screenEle.style.height = `${finalHeight}px`
	}

	static inject(): void {
		let screenEle = document.getElementById(REEDY_SCREEN_ID)
		if (screenEle !== null) {
			console.log(`ReedyScreen.inject: screen element already exists`)
			return
		}
		screenEle = ReedyScreen.create()
		document.body.appendChild(screenEle)
		console.log('ReedyScreen.inject: Reedy screen div injected')
	}

	static turnOn(): void {
		const screenEle = ReedyScreen.getScreenEle()
		screenEle.style.display = REEDY_SCREEN_DISPLAY
		console.log(`Reedy screen turned on!`)
	}

	static turnOff(): void {
		const screenEle = ReedyScreen.getScreenEle()
		screenEle.style.display = 'none'
		console.log(`Reedy screen turned off!`)
	}

	/*
	* if Reedy screen is on return true
	* else return false
	*/
	static isOn(): boolean {
		const screenEle = ReedyScreen.getScreenEle()
		return !(screenEle.style.display === 'none')
	}

	static toggle(): void {
		if (ReedyScreen.isOn()) {
			ReedyScreen.turnOff()
			return
		}
		ReedyScreen.turnOn()
	}
}
