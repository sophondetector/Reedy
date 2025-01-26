const SENT_SPLITTER_REGEX = /([\.\?\!]"?(?![^\(]*\))(\[\d+\])? [A-Z])/g

/*
	* returns a list numbers which are indexes of sent endings
*/
function getSentEnds(text: string): Array<number> {
	const regRes = text.matchAll(SENT_SPLITTER_REGEX)
	//@ts-ignore
	const arr = regRes.toArray()
	//@ts-ignore
	const idxs = arr.map((ite => ite.index))
	return idxs
}

function ends2Bounds(ends: Array<number>, finalEnd: number): Array<Array<number>> {
	let beg = 0
	let end;
	const res = []
	for (let idx = 0; idx < ends.length; idx++) {
		end = ends[idx] + 1
		res.push([beg, end])
		beg = end
	}
	res.push([beg + 1, finalEnd])
	return res
}

function bound2Sent(bound: Array<number>, text: string): string {
	return text.slice(bound[0], bound[1])
}

function mergeBounds(b1: Array<number>, b2: Array<number>): Array<number> {
	return [b1[0], b2[1]]
}

function nameCheck(bounds: Array<Array<number>>, text: string): Array<Array<number>> {
	const res = []
	for (let idx = 0; idx < bounds.length; idx++) {
		const bound = bounds[idx]
		const sent = bound2Sent(bound, text)
		if (/\s[A-Z]\.\s?$/.test(sent)) {
			idx++
			const newBound = bounds[idx]
			const finalBound = mergeBounds(bound, newBound)
			res.push(finalBound)
			continue
		}
		res.push(bound)
	}
	return res
}

export function getSentBounds(text: string): Array<Array<number>> {
	const ends = getSentEnds(text)
	const bounds = ends2Bounds(ends, text.length)
	const bounds2 = nameCheck(bounds, text)
	return bounds2
}

