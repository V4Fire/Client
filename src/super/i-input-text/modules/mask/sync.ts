/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInputText from 'super/i-input-text/i-input-text';
import { SyncMaskWithTextOptions } from 'super/i-input-text/interface';
import { fitForText } from 'super/i-input-text/modules/mask/helpers';

/**
 * Synchronizes the component mask with the specified text value
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
		unsafe: {compiledMask: mask, maskPlaceholder}
	} = component;

	if (mask == null) {
		return;
	}

	fitForText(component, text);

	const
		isFocused = unsafe.mods.focused === 'true';

	const
		{symbols: maskSymbols} = mask!,
		{maskText = mask!.text} = opts;

	let
		start = 0,
		end = 0;

	if (text !== '') {
		start = opts.start ?? 0;
		end = opts.end ?? 0;
	}

	let
		withoutSelection = start === end;

	let
		maskedInput = '',
		cursorPos = -1;

	if (text === '') {
		if (isFocused) {
			start = 0;
			end = 0;
			withoutSelection = true;
			maskedInput = mask!.placeholder;
		}

	} else {
		const chunks = [...text.letters()]
			.slice(start, withoutSelection ? undefined : end);

		for (let i = 0; i < maskSymbols.length; i++) {
			const
				maskSymbol = maskSymbols[i];

			// Restoration of values that don't match the selection range
			if (i < start || !withoutSelection && i > end) {
				if (Object.isRegExp(maskSymbol)) {
					maskedInput += resolveNonTerminalFromBuffer(maskSymbol, i);

				} else {
					maskedInput += maskSymbol;
				}

				continue;
			}

			if (Object.isRegExp(maskSymbol)) {
				if (chunks.length > 0) {
					// Skip all symbols that don't match the non-terminal grammar
					while (chunks.length > 0 && !maskSymbol.test(chunks[0])) {
						chunks.shift();
					}

					if (chunks.length > 0) {
						maskedInput += chunks[0];
						cursorPos++;
					}
				}

				// There are no symbols from the raw input that match the non-terminal grammar
				if (chunks.length === 0) {
					maskedInput += resolveNonTerminalFromBuffer(maskSymbol, i);

				} else {
					chunks.shift();
				}

			// This is a static symbol from the mask
			} else {
				maskedInput += maskSymbol;
			}
		}
	}

	unsafe.text = maskedInput;
	mask!.text = maskedInput;

	if (isFocused) {
		if (withoutSelection) {
			cursorPos = start + cursorPos + 1;

			while (cursorPos < maskSymbols.length && !Object.isRegExp(maskSymbols[cursorPos])) {
				cursorPos++;
			}

		} else {
			cursorPos = end;
		}

		mask!.start = cursorPos;
		mask!.end = cursorPos;

		unsafe.$refs.input.setSelectionRange(cursorPos, cursorPos);
	}

	function resolveNonTerminalFromBuffer(pattern: RegExp, i: number): string {
		const
			char = maskText[i];

		if (!pattern.test(char)) {
			return maskPlaceholder;
		}

		return char;
	}
}
