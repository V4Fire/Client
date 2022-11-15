/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type Mask from 'components/super/i-input-text/mask/class';

import { fitForText } from 'components/super/i-input-text/mask/fit';
import { convertCursorPositionToRaw } from 'components/super/i-input-text/mask/helpers';

import type { SyncMaskWithTextOptions } from 'components/super/i-input-text/interface';

const
	$$ = symbolGenerator();

/**
 * Synchronizes the component mask with the specified text value.
 *
 * The component may already have some masked text as its value (by default, the value is taken from the DOM node,
 * but you can specify it directly). So we need to apply a new text to the old value with or without limiting bounds to
 * update. If only a part of the mask is modified, the rest symbols from the old masked text will be preserved.
 *
 * The resulting text is saved to the input. The cursor position is updated too.
 *
 * @param text - the text to synchronize or an iterable of Unicode symbols
 * @param [opts] - additional options
 */
export function syncWithText(
	this: Mask,
	text: CanIter<string>,
	opts: SyncMaskWithTextOptions = {}
): void {
	const {
		ctx,
		ctx: {maskPlaceholder},
		compiledMask: originalMask
	} = this;

	if (originalMask == null) {
		return;
	}

	const
		originalTextChunks = toArray(opts.inputText ?? originalMask.text);

	const
		from = opts.from ?? 0,
		to = opts.to ?? originalMask.symbols.length;

	text = originalTextChunks
		.slice(0, from)
		.concat(toArray(text), originalTextChunks.slice(to + 1))
		.join('');

	const mask = opts.fitMask !== false ?
		fitForText.call(this, text) :
		originalMask;

	if (mask == null) {
		return;
	}

	const {
		symbols: maskSymbols
	} = mask;

	const
		textChunks = toArray(text),
		isFocused = ctx.mods.focused === 'true',
		isEmptyText = !Object.isTruly(opts.from) && textChunks.length === 0;

	let
		newMaskedText = '',
		cursorPos = opts.cursorPos ?? from;

	if (isEmptyText) {
		newMaskedText = mask.placeholder;

	} else {
		for (let i = 0; i < maskSymbols.length; i++) {
			const
				maskEl = maskSymbols[i];

			if (Object.isRegExp(maskEl)) {
				if (textChunks.length > 0) {
					// Skip all symbols that don't match the non-terminal grammar
					while (
						textChunks.length > 0 && (
							(!opts.preservePlaceholders || textChunks[0] !== maskPlaceholder) &&
							!maskEl.test(textChunks[0])
						)
						) {
						textChunks.shift();
					}

					if (textChunks.length > 0) {
						newMaskedText += textChunks[0];

						if (!opts.preserveCursor) {
							cursorPos++;
						}
					}
				}

				// There are no symbols from the raw input that match the non-terminal grammar
				if (textChunks.length === 0) {
					newMaskedText += maskPlaceholder;

				} else {
					textChunks.shift();
				}

				// This is a static symbol from the mask
			} else {
				newMaskedText += maskEl;

				if (!opts.preserveCursor && textChunks.length > 0) {
					cursorPos++;
				}
			}
		}
	}

	mask.text = newMaskedText;
	ctx.updateTextStore(newMaskedText);

	// If the component is focused, we need to correct the cursor position
	if (isFocused) {
		const needRewindCursorPos =
			!opts.preserveCursor &&
			newMaskedText[cursorPos] !== mask.placeholder &&
			cursorPos < (opts.to ?? maskSymbols.length) - 1;

		if (needRewindCursorPos) {
			do {
				cursorPos++;

			} while (cursorPos < to && !Object.isRegExp(maskSymbols[cursorPos]));
		}

		mask.selectionStart = cursorPos;
		mask.selectionEnd = cursorPos;

		cursorPos = convertCursorPositionToRaw.call(this, cursorPos);
		ctx.$refs.input.setSelectionRange(cursorPos, cursorPos);
	}

	function toArray(iter: Iterable<string>): string[] {
		return [...Object.isString(iter) ? iter.letters() : iter];
	}
}

/**
 * Synchronizes the `$refs.input.text` property with the `text` field
 */
export function syncInputWithField(this: Mask): void {
	const {
		ctx: {
			text,
			$refs: {input}
		}
	} = this;

	if (this.compiledMask == null || !Object.isTruly(input)) {
		return;
	}

	input.value = text;
}

/**
 * Synchronizes the `text` field with the `$refs.input.text` property
 */
export function syncFieldWithInput(this: Mask): Promise<void> {
	const {
		ctx,
		compiledMask
	} = this;

	return this.async.nextTick({label: $$.syncFieldWithInput}).then(() => {
		const {
			$refs: {input}
		} = ctx;

		if (compiledMask == null || !Object.isTruly(input)) {
			return;
		}

		const {
			symbols: maskSymbols
		} = compiledMask;

		const
			from = compiledMask.selectionStart ?? 0,
			to = compiledMask.selectionEnd ?? maskSymbols.length,
			normalizedTo = from === to ? to + 1 : to;

		if (from === 0 || to >= maskSymbols.length) {
			syncWithText.call(this, input.value);
			return;
		}

		const
			originalTextChunks = [...ctx.text.letters()],
			textChunks = [...input.value.letters()].slice(from, normalizedTo);

		for (let i = from, j = 0; i < normalizedTo; i++, j++) {
			const
				char = textChunks[j],
				maskEl = maskSymbols[i];

			if (Object.isRegExp(maskEl)) {
				if (!maskEl.test(char)) {
					textChunks[j] = ctx.maskPlaceholder;
				}

			} else {
				textChunks[j] = originalTextChunks[i];
			}
		}

		const
			textTail = normalizedTo >= maskSymbols.length ? '' : originalTextChunks.slice(normalizedTo),
			textToSync = textChunks.concat(textTail);

		syncWithText.call(this, textToSync, {
			from,

			fitMask: false,
			cursorPos: to,

			preserveCursor: true,
			preservePlaceholders: true
		});
	});
}

/**
 * Sets a position of the selection cursor at the first non-terminal symbol from the mask
 */
export function setCursorPositionAtFirstNonTerminal(this: Mask): void {
	const {
		ctx,
		compiledMask
	} = this;

	if (compiledMask == null) {
		return;
	}

	if (ctx.mods.empty === 'true') {
		syncWithText.call(this, '');
	}

	let
		pos = 0;

	for (let o = compiledMask.symbols, i = 0; i < o.length; i++) {
		if (Object.isRegExp(o[i])) {
			pos = i;
			break;
		}
	}

	pos = convertCursorPositionToRaw.call(this, pos);
	ctx.$refs.input.setSelectionRange(pos, pos);
}
