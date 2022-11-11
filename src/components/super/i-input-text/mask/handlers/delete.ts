/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Mask from 'components/super/i-input-text/mask/class';

import { fitForText } from 'components/super/i-input-text/mask/fit';
import { syncWithText } from 'components/super/i-input-text/mask/sync';

import { getNormalizedSelectionBounds } from 'components/super/i-input-text/mask/normalizers';
import { convertCursorPositionToRaw } from 'components/super/i-input-text/mask/helpers';

/**
 * Handler: removing characters from the mask via `backspace/delete` buttons
 * @param e
 */
export function onDelete(this: Mask, e: KeyboardEvent): void {
	const {
		ctx,
		ctx: {
			text,
			$refs: {input}
		},

		compiledMask
	} = this;

	const canIgnore =
		compiledMask == null ||

		!Object.isTruly(input) ||

		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		!{Backspace: true, Delete: true}[e.key];

	if (canIgnore) {
		return;
	}

	e.preventDefault();

	const [
		selectionStart,
		selectionEnd
	] = getNormalizedSelectionBounds.call(this);

	switch (e.key) {
		case 'Delete': {
			syncWithText.call(this, '', {
				from: selectionStart,
				to: selectionEnd - selectionStart > 1 ? selectionEnd - 1 : selectionEnd,
				preserveCursor: true
			});

			break;
		}

		case 'Backspace': {
			const
				textChunks = [...text.letters()],
				fittedMask = fitForText.call(this, textChunks);

			if (fittedMask == null) {
				return;
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
					fittedTextChunks[cursorPos] = ctx.maskPlaceholder;
				}
			}

			cursorPos = withoutSelection ? cursorPos : selectionStart;

			while (cursorPos < maskSymbols.length && !Object.isRegExp(maskSymbols[cursorPos])) {
				cursorPos++;
			}

			ctx.updateTextStore(fittedTextChunks.join(''));
			cursorPos = convertCursorPositionToRaw.call(this, cursorPos);
			input.setSelectionRange(cursorPos, cursorPos);

			break;
		}

		default:
			// Do nothing
	}
}
