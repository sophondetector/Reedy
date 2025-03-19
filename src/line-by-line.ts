const TEXT_NODE_NAME = '#text'


export function ele2Ranges(ele: Element): Array<Range> {
	const textNodes = getAllTextNodes(ele)
	return textNodes2Ranges(textNodes)
}

function getAllTextNodes(node: Node): Node[] {
	const res = []
	if (node.nodeName === TEXT_NODE_NAME) {
		res.push(node)
		return res
	}
	for (const cn of node.childNodes) {
		const iterRes = getAllTextNodes(cn)
		res.push(...iterRes)
	}
	return res
}

function textNodes2Ranges(listOfTextNodes: Array<Node>) {
	listOfTextNodes = listOfTextNodes.filter((tn) => tn.textContent!.trim().length > 0)

	const thresh = 5
	const res = []

	let rng = new Range()
	let offset = 0
	let nodeIdx = 0

	rng.setStart(listOfTextNodes[0], offset)
	rng.setEnd(listOfTextNodes[0], offset)

	let bottom = rng.getBoundingClientRect().bottom
	let curMaxOffset = listOfTextNodes[nodeIdx].textContent?.length || 0

	const maxIters = 1e3
	let counter = 0
	while (nodeIdx < listOfTextNodes.length) {
		counter++
		if (counter > maxIters) {
			break
		}

		let shouldInc = true
		if (offset >= curMaxOffset) {
			nodeIdx++
			offset = 0
			curMaxOffset = listOfTextNodes[nodeIdx].textContent?.length || 0
			shouldInc = false
		}

		const testRng = rng.cloneRange()
		testRng.setEnd(listOfTextNodes[nodeIdx], offset + (shouldInc ? 1 : 0))
		const testBottom = testRng.getBoundingClientRect().bottom

		if (testBottom - bottom > thresh) {
			res.push(rng)
			rng = new Range()
			rng.setStart(testRng.endContainer, testRng.endOffset)
			rng.setEnd(testRng.endContainer, testRng.endOffset)
			continue
		}

		offset++
		rng = testRng
	}

	res.forEach(r => console.log(r.toString()))
	return res
}
