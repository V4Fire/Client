/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';

import { fitForText, convertCursorPositionToRaw } from 'super/i-input-text/modules/mask/helpers';
import type { SyncMaskWithTextOptions } from 'super/i-input-text/modules/mask/interface';

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
 * @param text - text to synchronize or a list of Unicode symbols
 * @param [opts] - additional options
 */
export function syncWithText<C extends iInputText>(
	component: C,
	text: CanArray<string>,
	opts: SyncMaskWithTextOptions = {}
): void {
	const {
		unsafe,
		unsafe: {maskPlaceholder}
	} = component;

	const
		originalMask = unsafe.compiledMask,
		mask = fitForText(component, text);

	if (originalMask == null || mask == null) {
		return;
	}

	const
		{symbols: maskSymbols} = mask;

	const
		textChunks = Object.isArray(text) ? text.slice() : [...text.letters()];

	const originalMaskedTextChunks = [
		...Object.isArray(opts.inputText) ?
			opts.inputText :
			(opts.inputText ?? mask.text).letters()
	];

	const
		isFocused = unsafe.mods.focused === 'true',
		isEmptyText = !Object.isTruly(opts.from) && textChunks.length === 0;

	let
		from = 0,
		to = 0;

	if (!isEmptyText) {
		from = opts.from ?? from;
		to = opts.to == null || opts.to === from ? maskSymbols.length : opts.to;
	}

	const
		overwriteWithPlaceholder = from === 0 && to === maskSymbols.length || textChunks.length === 0;

	let
		newMaskedText = '',
		cursorPos = from;

	if (isEmptyText) {
		newMaskedText = mask.placeholder;

	} else {
		for (let i = 0; i < maskSymbols.length; i++) {
			const
				maskEl = maskSymbols[i];

			// Restoration of values that don't match the selection range
			if (i < from || i > to) {
				if (Object.isRegExp(maskEl)) {
					newMaskedText += resolveNonTerminalFromBuffer(maskEl, i);

				} else {
					newMaskedText += maskEl;
				}

				continue;
			}

			if (Object.isRegExp(maskEl)) {
				if (textChunks.length > 0) {
					// Skip all symbols that don't match the non-terminal grammar
					while (textChunks.length > 0 && !maskEl.test(textChunks[0])) {
						textChunks.shift();
					}

					if (textChunks.length > 0) {
						newMaskedText += textChunks[0];
						cursorPos++;
					}
				}

				// There are no symbols from the raw input that match the non-terminal grammar
				if (textChunks.length === 0) {
					if (overwriteWithPlaceholder) {
						newMaskedText += maskPlaceholder;

					} else {
						newMaskedText += resolveNonTerminalFromBuffer(maskEl, i);
					}

				} else {
					textChunks.shift();
				}

			// This is a static symbol from the mask
			} else {
				newMaskedText += maskEl;

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

		cursorPos = convertCursorPositionToRaw(component, cursorPos);
		unsafe.$refs.input.setSelectionRange(cursorPos, cursorPos);
	}

	function resolveNonTerminalFromBuffer(pattern: RegExp, pos: number): string {
		const
			char = originalMaskedTextChunks[pos];

		if (!pattern.test(char)) {
			return maskPlaceholder;
		}

		return char;
	}
}
