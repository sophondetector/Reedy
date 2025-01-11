const SENT_SPLITTER_REGEX = /([\.\?\!]"?(?![^\(]*\)) )/g

/*
	* returns a list numbers which are indexes of sent endings
*/
export function getSentEnds(text: string): Array<number> {
	const regRes = text.matchAll(SENT_SPLITTER_REGEX)
	//@ts-ignore
	const arr = regRes.toArray()
	//@ts-ignore
	const idxs = arr.map((ite => ite.index))
	return idxs
}
