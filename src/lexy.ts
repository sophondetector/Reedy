export type LexedSent = string
export type LexedPara = LexedSent[]
export type LexedText = LexedPara[]

const ABBREV_FIX_ROUNDS: number = 4
const SUFFIX_FIX_ROUNDS: number = 4

const PARA_SPLITTER_REGEX = /\n\s*/gm
const SENT_SPLITTER_REGEX = /([\.\?\!]"?(?![^\(]*\)) )/g
const SUFFIX_REGEX = /([Jj]r\.|[Ss]r\.|[pP][hH]\.?[Dd]\.|[mMjJ]\.?[dD]\.)\s+$/g
//@ts-ignore
const STARTS_WITH_CAPITAL_REGEX = /^[A-Z]/
const STARTS_WITH_LOWERCASE_REGEX = /^[a-z]/
const HONOR_ABBR_REGEX = /(Dr\.|Mr\.|Mrs\.|Fr\.)\s+$/g

export function lex(text: string): LexedText {
	const paraTexts = splitParas(text)
	const stage1 = paraTexts.map(splitSents)
	const stage2 = stage1.map(reCombinePunct)
	const stage3 = stage2.map(reCombinePunctQuote)
	const stage4 = stage3.map(quoteFixer)

	let stage5 = stage4.map(abbrevFixer)
	for (let roundNum = 0; roundNum < ABBREV_FIX_ROUNDS - 1; roundNum++) {
		stage5 = stage5.map(abbrevFixer)
	}

	let stage6 = stage5.map(suffixAbbrevFixer)
	for (let roundNum = 0; roundNum < SUFFIX_FIX_ROUNDS - 1; roundNum++) {
		stage6 = stage6.map(suffixAbbrevFixer)
	}

	const stage7 = stage6.map(citationFixer)
	const stage8 = stage7.map(fixNumberedPara)

	return stage8
}

function splitParas(text: string): string[] {
	const res = text.split(PARA_SPLITTER_REGEX)
	return res
}

function splitSents(text: string): LexedPara {
	return text.split(SENT_SPLITTER_REGEX)
}

function reCombinePunct(para: LexedPara): LexedPara {
	const res = [para[0]]
	for (let idx = 1; idx < para.length; idx++) {
		const sent = para[idx]
		if (sent.trim().length > 1) {
			res.push(sent)
			continue
		}
		const newSent = res.pop() + sent
		res.push(newSent)
	}
	return res
}

function reCombinePunctQuote(para: LexedPara): LexedPara {
	const punctQuoteRegex = /[\.\!\?]\"\s*/
	const res = [para[0]]
	for (let idx = 1; idx < para.length; idx++) {
		const sent = para[idx]
		if (!punctQuoteRegex.test(sent)) {
			res.push(sent)
			continue
		}
		const newSent = res.pop() + sent
		res.push(newSent)
	}
	return res
}

/*
	* countChar("aaabbac", "a") -> 4
*/
function countChar(input: string, char: string | RegExp): number {
	return input.split(char).length - 1
}

/*
	* this fixes ["this issue. ][" ...]
*/
function quoteFixer(para: LexedPara): LexedPara {
	const ENDING_QUOTE = ' "'
	const res = [para[0]]
	for (let idx = 1; idx < para.length; idx++) {
		const sent = para[idx]
		if (sent.slice(0, 2) !== ENDING_QUOTE) {
			res.push(sent)
			continue
		}
		// this means that the current sent starts with ' "'
		const prev = para[idx - 1]
		const hasEvenQuotes = countChar(prev, '"') % 2
		if (hasEvenQuotes === 0) {
			res.push(sent)
			continue
		}
		res[idx - 1] = prev + ENDING_QUOTE
		res.push(sent.slice(2, sent.length))
	}
	return res
}

function abbrevFixer(para: LexedPara): LexedPara {
	const res: LexedPara = [para[0]]
	for (let idx = 1; idx < para.length; idx++) {
		const cur = para[idx]
		const prev = res[res.length - 1]
		if (!HONOR_ABBR_REGEX.test(prev)) {
			res.push(cur)
			continue
		}
		res[res.length - 1] = prev + cur
	}
	return res
}

function suffixAbbrevFixer(para: LexedPara): LexedPara {
	const res: LexedPara = [para[0]]
	for (let idx = 1; idx < para.length; idx++) {
		const cur = para[idx]
		const prev = res[res.length - 1]
		if (!SUFFIX_REGEX.test(prev)) {
			res.push(cur)
			continue
		}

		// if cur doesn't start w/ a lowercase, continue
		if (!STARTS_WITH_LOWERCASE_REGEX.test(cur)) {
			res.push(cur)
			continue
		}

		res[res.length - 1] = prev + cur
	}
	return res
}

function citationFixer(para: LexedPara): LexedPara {
	// This doesn't cause repeats of citations only if the interior
	// clause is BOTH a non capturing group (e.g. (?:...)) followed
	// by a plus
	// I'm not really sure why this works
	const citationRegex = /([\.\?\!](?:\[\d+\])+) /g
	const res: LexedPara = []
	for (let idx = 0; idx < para.length; idx++) {
		const sent = para[idx]
		const sents = sent.split(citationRegex)
		if (sents.length > 1) {
			res.push(...citationFixerFixer(sents))
			continue
		}
		res.push(...sents)
	}
	return res
}

function citationFixerFixer(sents: string[]): string[] {
	const res = []
	for (let idx = 1; idx < sents.length; idx += 2) {
		res.push(sents[idx - 1] + sents[idx])
	}
	res.push(sents[sents.length - 1])
	return res
}

function fixNumberedPara(para: LexedPara): LexedPara {
	const firstSent = para[0]
	const numberedParaRegex = /\d+\./
	if (!firstSent.match(numberedParaRegex)) {
		return para
	}

	const res = []
	res.push(firstSent + para[1])
	res.push(...para.slice(2))
	return res
}
