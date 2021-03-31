/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';
import { convertCursorPositionToRaw, getNormalizedSelectionBounds } from 'super/i-input-text/modules/mask/helpers';

/**
 * Handler: removing characters from the mask via "backspace/delete" buttons
 *
 * @param component
 * @param e
 */
export async function onDelete<C extends iInputText>(component: C, e: KeyboardEvent): Promise<void> {
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
		return;
	}

	e.preventDefault();

	const
		maskSymbols = mask!.symbols,
		textChunks = [...text.letters()];

	const
		[selectionStart, selectionEnd] = getNormalizedSelectionBounds(component);

	const
		withoutSelection = selectionStart === selectionEnd;

	let
		cursorPos = 0;

	switch (e.key) {
		case 'Delete': {
			await unsafe.syncMaskWithText(textChunks.slice(selectionStart + 1), {
				from: selectionStart,
				to: selectionEnd
			});

			break;
		}

		case 'Backspace': {
			let symbolsInSelection = selectionEnd - selectionStart;
			symbolsInSelection = symbolsInSelection > 0 ? symbolsInSelection : 1;

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
					textChunks[cursorPos] = unsafe.maskPlaceholder;
				}
			}

			cursorPos = withoutSelection ? cursorPos : selectionStart;

			while (cursorPos < maskSymbols.length && !Object.isRegExp(maskSymbols[cursorPos])) {
				cursorPos++;
			}

			const
				resultText = textChunks.join('');

			if (resultText === mask!.placeholder) {
				await unsafe.syncMaskWithText('');

			} else {
				unsafe.updateTextStore(resultText);
				cursorPos = convertCursorPositionToRaw(component, cursorPos);
				input.setSelectionRange(cursorPos, cursorPos);
			}

			break;
		}

		default:
			// Do nothing
	}
}
