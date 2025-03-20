// TODO this has an issue where ranges are cut off one char too early; why?!?!?!
export function genericHandler(): Array<Element> {
	const qsaResult = document.querySelectorAll('h1, h2, h3, h4, h5, p')
	const arr = Array.from(qsaResult)
	return arr
}
