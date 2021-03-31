/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';

import {

	fitForText,
	convertCursorPositionToRaw,
	getNormalizedSelectionBounds

} from 'super/i-input-text/modules/mask/helpers';

/**
 * Handler: there is occur a keypress action on the masked input
 *
 * @param component
 * @param e
 */
export function onKeyPress<C extends iInputText>(component: C, e: KeyboardEvent): void {
	const {
		unsafe,
		unsafe: {text, compiledMask: mask, $refs: {input}}
	} = component;

	if (!Object.isTruly(input)) {
		return;
	}

	const canIgnore =
		mask == null ||

		e.altKey ||
		e.shiftKey ||
		e.ctrlKey ||
		e.metaKey ||

		e.key === 'Tab';

	if (canIgnore) {
		return;
	}

	e.preventDefault();

	let
		valToInput = e.key;

	const
		selectionStart = input.selectionStart ?? 0,
		selectionEnd = input.selectionEnd ?? 0;

	const [
		normalizedSelectionStart,
		normalizedSelectionEnd
	] = getNormalizedSelectionBounds(component, selectionStart, selectionEnd);

	const
		textChunks = [...text.letters()],
		splicedTextChunks = textChunks.slice();

	splicedTextChunks
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		.splice(normalizedSelectionStart, normalizedSelectionEnd - normalizedSelectionStart || 1, valToInput);

	const
		fittedMask = fitForText(component, splicedTextChunks);

	if (fittedMask == null) {
		return;
	}

	const
		maskSymbols = fittedMask.symbols,
		fittedTextLetters = textChunks.slice(0, maskSymbols.length);

	const
		additionalPlaceholder = [...fittedMask.placeholder.letters()].slice(fittedTextLetters.length),
		fittedTextChunks = Array.concat([], fittedTextLetters, ...additionalPlaceholder);

	let
		symbolsInSelection = [...text.slice(selectionStart, selectionEnd).letters()].length + 1;

	let
		cursorPos = normalizedSelectionStart,
		needInsertInputVal = true;

	while (symbolsInSelection-- > 0) {
		const
			rangeStart = normalizedSelectionEnd - symbolsInSelection;

		let
			maskElPos = rangeStart,
			maskEl = maskSymbols[maskElPos];

		if (needInsertInputVal && !Object.isRegExp(maskEl)) {
			do {
				maskElPos++;

			} while (maskElPos < maskSymbols.length && !Object.isRegExp(maskSymbols[maskElPos]));

			maskEl = maskSymbols[maskElPos];
		}

		if (Object.isRegExp(maskEl) && (!needInsertInputVal || maskEl.test(valToInput))) {
			fittedTextChunks[maskElPos] = valToInput;

			if (needInsertInputVal) {
				cursorPos = maskElPos + 1;
				valToInput = unsafe.maskPlaceholder;
				needInsertInputVal = false;
			}
		}
	}

	while (cursorPos < maskSymbols.length && !Object.isRegExp(maskSymbols[cursorPos])) {
		cursorPos++;
	}

	unsafe.updateTextStore(fittedTextChunks.join(''));

	cursorPos = convertCursorPositionToRaw(component, cursorPos);
	input.setSelectionRange(cursorPos, cursorPos);
}
