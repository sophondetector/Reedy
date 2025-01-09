import { LECS } from "./consts.ts"

/**
 * uses hidden <input> to access/open system file dialogue
 *
 * @private
 * @return {Promise<File | Error>} A promise that resolves to the parsed string.
 */
export async function getFileLegacy(): Promise<File | Error> {
	const filePicker = document.querySelector(LECS.common.filePicker) as HTMLInputElement
	return new Promise((resolve, reject) => {
		//@ts-ignore
		filePicker.onchange = (e) => {
			const file = filePicker.files![0];
			if (file) {
				resolve(file);
				return;
			}
			reject(new Error('AbortError'));
		};
		filePicker.click();
	});
};

/**
 * Reads the raw text from a file.
 *
 * @private
 * @param {File} file
 * @return {Promise<string>} A promise that resolves to the parsed string.
 */
export function readFileLegacy(file: File): Promise<string | undefined> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.addEventListener('loadend', (e) => {
			// @ts-ignore
			const text = e.srcElement.result;
			resolve(text);
		});
		reader.readAsText(file);
	});
}

