export type LexedSent = string
export type LexedPara = LexedSent[]
export type LexedText = LexedPara[]

const ABBREV_FIX_ROUNDS: number = 2
const SUFFIX_FIX_ROUNDS: number = 2

const PARA_SPLITTER_REGEX = /\n\s*/gm
const SENT_SPLITTER_REGEX = /([\.\?\!]["”]?(?![^\(]*\)) )/g
const SUFFIX_REGEX = /([Jj]r\.|[Ss]r\.|[pP][hH]\.?[Dd]\.|[mMjJ]\.?[dD]\.)\s+$/g
//@ts-ignore
const STARTS_WITH_CAPITAL_REGEX = /^[A-Z]/
const STARTS_WITH_LOWERCASE_REGEX = /^[a-z]/
const HONOR_ABBR_REGEX = /(Dr\.|Mr\.|Mrs\.|Fr\.)\s+$/g

export function lex(text: string): LexedText {
	const paraTexts = splitParas(text)
	const finalText = paraTexts.map(lexPara)
	return finalText
}

function lexPara(para: string): LexedPara {
	const stage0 = para
	const stage1 = splitSents(stage0)
	const stage2 = reCombinePunct(stage1)
	const stage3 = reCombinePunctQuote(stage2)
	const stage4 = quoteFixer(stage3)
	const stage5 = abbrevFixer(stage4, ABBREV_FIX_ROUNDS)
	const stage6 = suffixAbbrevFixer(stage5, SUFFIX_FIX_ROUNDS)
	const stage7 = citationFixer(stage6)
	const stage8 = fixNumberedPara(stage7)
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
	const punctQuoteRegex = /[\.\!\?][\"”]\s*/
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

function abbrevFixerInner(para: LexedPara): LexedPara {
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

function abbrevFixer(para: LexedPara, roundsLeft: number = 2): LexedPara {
	if (roundsLeft === 0) return para
	const newPara = abbrevFixerInner(para)
	return abbrevFixer(newPara, roundsLeft - 1)
}

function suffixAbbrevFixerInner(para: LexedPara): LexedPara {
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

function suffixAbbrevFixer(para: LexedPara, roundsLeft: number = 2): LexedPara {
	if (roundsLeft === 0) return para
	const newPara = suffixAbbrevFixerInner(para)
	return suffixAbbrevFixer(newPara, roundsLeft - 1)
}

function citationFixer(para: LexedPara): LexedPara {
	// This doesn't cause repeats of citations only if the interior
	// clause is BOTH a non capturing group (e.g. (?:...)) followed
	// by a plus
	// I'm not really sure why this works
	const citationRegex = /([\.\?\!]["”]?(?:\[\d+\])+) /g
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
	const numberedParaRegex = /^\d+\./
	if (!firstSent.match(numberedParaRegex)) {
		return para
	}
	const res = []
	res.push(firstSent + para[1])
	res.push(...para.slice(2))
	return res
}
