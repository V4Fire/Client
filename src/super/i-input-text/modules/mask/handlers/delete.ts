/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from '/super/i-input-text/i-input-text';

import {

	fitForText,
	convertCursorPositionToRaw,
	getNormalizedSelectionBounds

} from '/super/i-input-text/modules/mask/helpers';

/**
 * Handler: removing characters from the mask via `backspace/delete` buttons
 *
 * @param component
 * @param e
 */
export function onDelete<C extends iInputText>(component: C, e: KeyboardEvent): boolean {
	const {
		unsafe,
		unsafe: {text, compiledMask: mask, $refs: {input}}
	} = component;

	const canIgnore =
		mask == null ||

		!Object.isTruly(input) ||

		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		!{Backspace: true, Delete: true}[e.key];

	if (canIgnore) {
		return false;
	}

	e.preventDefault();

	const
		[selectionStart, selectionEnd] = getNormalizedSelectionBounds(component);

	switch (e.key) {
		case 'Delete': {
			void unsafe.syncMaskWithText('', {
				from: selectionStart,
				to: selectionEnd - selectionStart > 1 ? selectionEnd - 1 : selectionEnd,
				preserveCursor: true
			});

			break;
		}

		case 'Backspace': {
			const
				textChunks = [...text.letters()],
				fittedMask = fitForText(component, textChunks);

			if (fittedMask == null) {
				return false;
			}

			const
				maskSymbols = fittedMask.symbols,
				fittedTextChunks = textChunks.slice(0, maskSymbols.length),
				withoutSelection = selectionStart === selectionEnd;

			let
				cursorPos = 0,
				symbolsInSelection = selectionEnd - selectionStart + (withoutSelection ? 1 : 0);

			while (symbolsInSelection-- > 0) {
				const
					rangeStart = selectionEnd - symbolsInSelection - 1;

				let
					maskElPos = rangeStart,
					maskEl = maskSymbols[maskElPos];

				if (!Object.isRegExp(maskEl) && withoutSelection) {
					do {
						maskElPos--;

					} while (maskElPos >= 0 && !Object.isRegExp(maskSymbols[maskElPos]));

					maskEl = maskSymbols[maskElPos];
				}

				if (Object.isRegExp(maskEl)) {
					cursorPos = rangeStart - (rangeStart - maskElPos);
					fittedTextChunks[cursorPos] = unsafe.maskPlaceholder;
				}
			}

			cursorPos = withoutSelection ? cursorPos : selectionStart;

			while (cursorPos < maskSymbols.length && !Object.isRegExp(maskSymbols[cursorPos])) {
				cursorPos++;
			}

			unsafe.updateTextStore(fittedTextChunks.join(''));
			cursorPos = convertCursorPositionToRaw(component, cursorPos);
			input.setSelectionRange(cursorPos, cursorPos);

			break;
		}

		default:
			// Do nothing
	}

	return true;
}
