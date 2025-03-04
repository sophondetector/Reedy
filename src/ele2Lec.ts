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

// TEST BLOCK FOR ele2Lec
// const lecs = [
// 	'#content > article > div > p:nth-child(4)',
// 	'#your_first_website_creating_the_content > a',
// 	'#content > article > section:nth-child(4) > div > dl > dd:nth-child(8) > p > a:nth-child(4) > code'
// ]
//
// for (const le of lecs) {
// 	const ele = Q(le) as HTMLElement
// 	const outLec = ele2Lec(ele)
// 	console.log(`outLec: ${outLec}`)
// }

