/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';

import { fitForText } from 'super/i-input-text/modules/mask/helpers';
import type { SyncMaskWithTextOptions } from 'super/i-input-text/interface';

/**
 * Synchronizes the component mask with the specified text value.
 *
 * The component can already have some masked text as a value (by default, the value is taken from the DOM node,
 * but you can specify it directly). So we need to apply a new text to the old value with or without limiting bounds to
 * update. If only a part of the mask is modified, the rest symbols from the old masked text will be preserved.
 *
 * The resulting text is saved to the input. The cursor position is updated too.
 *
 * @param component
 * @param text
 * @param [opts] - additional options
 */
export function syncWithText<C extends iInputText>(
	component: C,
	text: string,
	opts: SyncMaskWithTextOptions = {}
): void {
	const {
		unsafe,
		unsafe: {maskPlaceholder}
	} = component;

	const
		mask = fitForText(component, text);

	if (mask == null) {
		return;
	}

	const
		{symbols: maskSymbols} = mask,
		{inputText: originalMaskedText = mask.text} = opts;

	const
		isFocused = unsafe.mods.focused === 'true',
		isEmptyText = text === '';

	let
		from = 0,
		to = 0;

	if (!isEmptyText) {
		from = opts.from ?? from;
		to = opts.to == null || opts.to === from ? maskSymbols.length : opts.to;
	}

	const
		selectAll = from === 0 && to === maskSymbols.length;

	let
		newMaskedText = '',
		cursorPos = from;

	if (isEmptyText) {
		newMaskedText = mask.placeholder;

	} else {
		const
			textChunks = [...text.letters()];

		for (let i = 0; i < maskSymbols.length; i++) {
			const
				maskSymbol = maskSymbols[i];

			// Restoration of values that don't match the selection range
			if (i < from || i > to) {
				if (Object.isRegExp(maskSymbol)) {
					newMaskedText += resolveNonTerminalFromBuffer(maskSymbol, i);

				} else {
					newMaskedText += maskSymbol;
				}

				continue;
			}

			if (Object.isRegExp(maskSymbol)) {
				if (textChunks.length > 0) {
					// Skip all symbols that don't match the non-terminal grammar
					while (textChunks.length > 0 && !maskSymbol.test(textChunks[0])) {
						textChunks.shift();
					}

					if (textChunks.length > 0) {
						newMaskedText += textChunks[0];
						cursorPos++;
					}
				}

				// There are no symbols from the raw input that match the non-terminal grammar
				if (textChunks.length === 0) {
					if (selectAll) {
						newMaskedText += maskPlaceholder;

					} else {
						newMaskedText += resolveNonTerminalFromBuffer(maskSymbol, i);
					}

				} else {
					textChunks.shift();
				}

			// This is a static symbol from the mask
			} else {
				newMaskedText += maskSymbol;

				if (textChunks.length > 0) {
					cursorPos++;
				}
			}
		}
	}

	mask.text = newMaskedText;
	unsafe.updateTextStore(newMaskedText);

	// If the component is focused, we need to correct the cursor position
	if (isFocused) {
		const needRewindCursorPos =
			cursorPos < to - 1 &&
			newMaskedText[cursorPos] !== mask.placeholder;

		if (needRewindCursorPos) {
			do {
				cursorPos++;

			} while (cursorPos < to && !Object.isRegExp(maskSymbols[cursorPos]));
		}

		mask.start = cursorPos;
		mask.end = cursorPos;

		unsafe.$refs.input.setSelectionRange(cursorPos, cursorPos);
	}

	function resolveNonTerminalFromBuffer(pattern: RegExp, i: number): string {
		const
			char = originalMaskedText[i];

		if (!pattern.test(char)) {
			return maskPlaceholder;
		}

		return char;
	}
}
