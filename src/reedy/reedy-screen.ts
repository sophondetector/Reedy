const REEDY_SCREEN_ID = 'reedyScreen'
const REEDY_SCREEN_DISPLAY = 'flex'
const REEDY_SCREEN_BUFFER_RADIUS = 3

let OPACITY = .5

export class ReedyScreen {

	static create(): HTMLCanvasElement {
		// the box itself is transparent
		// and all around it is colored with the "shadow"

		const canvas = document.createElement('canvas')

		canvas.style.display = REEDY_SCREEN_DISPLAY
		canvas.style.position = `absolute`
		canvas.style.overflow = `auto`
		canvas.style.pointerEvents = `none` // this ensures mouse clicks "fall through" to the main content
		canvas.style.zIndex = `99999`

		canvas.style.top = `0px`
		canvas.style.left = `0px`
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight

		canvas.id = REEDY_SCREEN_ID

		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
		ctx.fillStyle = `rgba(0, 0, 255, ${OPACITY})`;

		return canvas
	}

	static drawScreen() {
		const canvas = ReedyScreen.getScreenEle()
		const ctx = ReedyScreen.getContext()
		ctx.fillStyle = `rgba(0, 0, 255, ${OPACITY})`;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	static animate() {
		ReedyScreen.drawScreen()
		requestAnimationFrame(ReedyScreen.animate)
	}

	static getScreenEle(): HTMLCanvasElement {
		const screenEle = document.getElementById(REEDY_SCREEN_ID)
		if (!screenEle) {
			throw new Error(`ReedyScreen.getScreenEle: could not find element with id ${REEDY_SCREEN_ID}`)
		}
		return screenEle as HTMLCanvasElement
	}

	static getContext(): CanvasRenderingContext2D {
		const canvas = ReedyScreen.getScreenEle()
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
		return ctx
	}

	static setScreenOpacity(opacity: number): void {
		console.log(`ReedyScreen.setScreenOpacity: opacity value ${opacity} received!`)
		OPACITY = opacity / 100
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
		ReedyScreen.animate()
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

