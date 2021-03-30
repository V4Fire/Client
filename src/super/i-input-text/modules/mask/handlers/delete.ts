/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';

/**
 * Handler: removing characters from the mask via "backspace/delete" buttons
 *
 * @param component
 * @param e
 */
export async function onDelete<C extends iInputText>(component: C, e: KeyboardEvent): Promise<void> {
	const {
		unsafe,
		unsafe: {
			compiledMask: mask,
			$refs: {input}
		}
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
		maskSymbols = mask!.symbols;

	const
		selectionStart = input.selectionStart ?? 0,
		selectionEnd = input.selectionEnd ?? 0,
		withoutSelection = selectionStart === selectionEnd;

	let
		{text} = unsafe;

	let
		pos = 0;

	switch (e.key) {
		case 'Delete': {
			const
				chunks = <string[]>[];

			let
				start = selectionStart,
				end = selectionEnd;

			for (let i = 0; i < maskSymbols.length; i++) {
				const
					symbol = maskSymbols[i],
					char = text[i];

				if (Object.isRegExp(symbol) && symbol.test(char)) {
					chunks.push(char);

				} else {
					if (i < selectionStart) {
						start--;
					}

					if (!withoutSelection && i < selectionEnd) {
						end--;
					}
				}
			}

			chunks.splice(start, withoutSelection ? 1 : end - start);
			text = chunks.join('');

			if (text === '') {
				await unsafe.syncMaskWithText('');

			} else {
				await unsafe.syncMaskWithText(text, {
					from: selectionStart,
					to: selectionEnd,
					inputText: ''
				});
			}

			break;
		}

		case 'Backspace': {
			const
				chunks = text.split('');

			let range = selectionEnd - selectionStart;
			range = range > 0 ? range : 1;

			while (range-- > 0) {
				const
					end = selectionEnd - range - 1;

				let
					maskEl = maskSymbols[end],
					prevMaskEl = '',
					i = end;

				if (!Object.isRegExp(maskEl) && withoutSelection) {
					prevMaskEl = maskEl;

					while (!Object.isRegExp(maskSymbols[--i]) && i > -1) {
						prevMaskEl += maskSymbols[i];
					}

					maskEl = maskSymbols[i];
				}

				if (Object.isRegExp(maskEl)) {
					pos = end - prevMaskEl.length;
					chunks[pos] = unsafe.maskPlaceholder;
				}
			}

			text = chunks.join('');

			let
				start = withoutSelection ? pos : selectionStart;

			while (start < maskSymbols.length && !Object.isRegExp(maskSymbols[start])) {
				start++;
			}

			if (text === mask!.placeholder) {
				await unsafe.syncMaskWithText('');

			} else {
				unsafe.updateTextStore(text);
				input.setSelectionRange(start, start);
			}

			break;
		}

		default:
		// Do nothing
	}
}
