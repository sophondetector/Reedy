export function genericHandler(root: Document | Element | null = null): Array<Element> {
	if (root === null) {
		root = document
	}
	const qsaResult = root.querySelectorAll('h1, h2, h3, h4, h5, p, a, ol, ul')
	const arr = Array.from(qsaResult)
	return arr
}
