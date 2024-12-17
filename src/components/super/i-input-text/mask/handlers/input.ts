/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Mask from 'components/super/i-input-text/mask/class';

import { fitForText } from 'components/super/i-input-text/mask/fit';
import { getNormalizedSelectionBounds } from 'components/super/i-input-text/mask/normalizers';
import { convertCursorPositionToRaw } from 'components/super/i-input-text/mask/helpers';

/**
 * Handler: there is occurred a keypress action on the masked input
 * @param e
 */
export function onKeyPress(this: Mask, e: KeyboardEvent): void {
	const {
		ctx,
		ctx: {
			text,
			maskPlaceholder,
			$refs: {input}
		},

		compiledMask
	} = this;

	if (!Object.isTruly(input)) {
		return;
	}

	let
		valToInput = e.key;

	const canIgnore =
		compiledMask == null ||

		e.altKey ||
		e.shiftKey ||
		e.ctrlKey ||
		e.metaKey ||

		// Ignore Tab, ArrowLeft and other stuff
		/^[A-Z][a-z0-9]/.test(valToInput);

	if (canIgnore) {
		return;
	}

	e.preventDefault();

	const
		[selectionStart, selectionEnd] = getNormalizedSelectionBounds.call(this);

	const
		selectionRange = selectionEnd - selectionStart;

	const
		textChunks = [...text.letters()],
		splicedTextChunks = textChunks.slice();

	splicedTextChunks
		.splice(selectionStart, selectionRange > 0 ? selectionRange : 1, valToInput);

	const
		fittedMask = fitForText.call(this, splicedTextChunks);

	if (fittedMask == null) {
		return;
	}

	const
		maskSymbols = fittedMask.symbols,
		boundedTextChunks = textChunks.slice(0, maskSymbols.length);

	const
		additionalPlaceholder = [...fittedMask.placeholder.letters()].slice(boundedTextChunks.length),
		fittedTextChunks = Array.toArray(boundedTextChunks, ...additionalPlaceholder);

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
				valToInput = maskPlaceholder;
				needInsertInputVal = false;
			}
		}
	}

	while (cursorPos < maskSymbols.length && !Object.isRegExp(maskSymbols[cursorPos])) {
		cursorPos++;
	}

	ctx.updateTextStore(fittedTextChunks.join(''));
	cursorPos = convertCursorPositionToRaw.call(this, cursorPos);
	input.setSelectionRange(cursorPos, cursorPos);

	ctx.localEmitter.emit('maskedText.change');
}
