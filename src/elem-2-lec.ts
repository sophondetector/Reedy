export function ele2lec(ele: HTMLElement): string {
	if (ele.id) return `#${ele.id}`
	let current = ele.localName
	if (current === 'html') return `html`

	if (ele.classList.toString()) {
		current += '.' + ele.classList.toString().replace(' ', '.')
	}

	let prevSibNum = 0
	const getPrevSibNum = (fle: Element) => {
		while (fle.previousElementSibling) {
			prevSibNum++
			fle = fle.previousElementSibling
		}
	}

	getPrevSibNum(ele)
	if (prevSibNum > 0) {
		current += `:nth-child(${prevSibNum})`
	}

	if (document.querySelectorAll(current).length === 1) return current

	return `${ele2lec(ele.parentElement!)} > ${current}`
}
