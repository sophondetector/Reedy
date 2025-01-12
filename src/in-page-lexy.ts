const SENT_SPLITTER_REGEX = /([\.\?\!]"?(?![^\(]*\)) )/g

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
		beg = end + 1
	}
	res.push([beg + 1, finalEnd])
	return res
}

export function getSentBounds(text: string): Array<Array<number>> {
	const ends = getSentEnds(text)
	const bounds = ends2Bounds(ends, text.length)
	return bounds
}

