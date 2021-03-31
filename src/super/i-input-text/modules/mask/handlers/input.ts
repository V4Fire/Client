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
		[selectionStart, selectionEnd] = getNormalizedSelectionBounds(component);

	const
		selectionRange = selectionEnd - selectionStart;

	const
		textChunks = [...text.letters()],
		splicedTextChunks = textChunks.slice();

	splicedTextChunks
		.splice(selectionStart, selectionRange > 0 ? selectionRange : 1, valToInput);

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
		symbolsInSelection = selectionRange + 1,
		cursorPos = selectionStart,
		needInsertInputVal = true;

	while (symbolsInSelection-- > 0) {
		const
			rangeStart = selectionEnd - symbolsInSelection;

		let
			maskElPos = rangeStart,
			maskEl = maskSymbols[maskElPos];

		if (needInsertInputVal && !Object.isRegExp(maskEl)) {
			do {
				maskElPos++;

			} while (maskElPos < maskSymbols.length && !Object.isRegExp(maskSymbols[maskElPos]));

			maskEl = maskSymbols[maskElPos];
		}

		const canModifyChunks =
			Object.isRegExp(maskEl) &&
			(!needInsertInputVal || maskEl.test(valToInput));

		if (canModifyChunks) {
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
