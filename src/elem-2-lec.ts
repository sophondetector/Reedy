export function ele2Lec(ele: HTMLElement): string {
	if (ele.id) return `#${ele.id}`
	let current = ele.localName
	if (current === 'html') return `html`

	if (ele.classList.toString()) {
		current += '.' + ele.classList.toString().replace(' ', '.')
	}

	let prevSibNum = 1
	const getPrevSibNum = (el: Element) => {
		while (el.previousElementSibling) {
			prevSibNum++
			el = el.previousElementSibling
		}
	}

	getPrevSibNum(ele)
	if (prevSibNum > 1) {
		current += `:nth-child(${prevSibNum})`
	}

	if (document.querySelectorAll(current).length === 1) return current

	return `${ele2Lec(ele.parentElement!)} > ${current}`
}
