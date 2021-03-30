/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';
import { fitForText } from 'super/i-input-text/modules/mask';

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

	const
		textChunks = [...text.letters()],
		splicedTextChunks = textChunks.slice();

	splicedTextChunks.splice(selectionStart, selectionEnd - selectionStart, valToInput);

	const
		fittedMask = fitForText(component, splicedTextChunks);

	if (fittedMask == null) {
		return;
	}

	const
		maskSymbols = fittedMask.symbols,
		fittedTextLetters = textChunks.slice(0, maskSymbols.length);

	const
		additionalPlaceholder = fittedMask.placeholder.slice(fittedTextLetters.length),
		fittedTextChunks = Array.concat([], fittedTextLetters, ...additionalPlaceholder.letters());

	let
		range = selectionEnd - selectionStart + 1,
		cursorPos = selectionStart,
		needInsertInputVal = true;

	while (range-- > 0) {
		const
			rangeStart = selectionEnd - range;

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
	input.setSelectionRange(cursorPos, cursorPos);
}
