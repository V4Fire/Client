/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type iInputText from 'super/i-input-text/i-input-text';

export const
	$$ = symbolGenerator();

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

			if (text !== '') {
				await unsafe.syncMaskWithText(text, {
					start: selectionStart,
					end: selectionEnd,
					maskText: ''
				});

			} else {
				await unsafe.syncMaskWithText('');
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
				unsafe.text = text;
				input.setSelectionRange(start, start);
			}

			break;
		}

		default:
		// Do nothing
	}
}

/**
 * Handler: "navigation" over the mask via "arrow" buttons or click events
 *
 * @param component
 * @param e
 */
export function onNavigate<C extends iInputText>(component: C, e: KeyboardEvent | MouseEvent): void {
	let canIgnore =
		e.altKey ||
		e.shiftKey ||
		e.ctrlKey ||
		e.metaKey;

	if (canIgnore) {
		return;
	}

	const {
		unsafe,
		unsafe: {$refs: {input}}
	} = component;

	let
		isKeyboardEvent = false,
		isLeftKey = false;

	if (e instanceof KeyboardEvent) {
		isKeyboardEvent = true;
		isLeftKey = e.key === 'ArrowLeft';
		canIgnore = !isLeftKey && e.key !== 'ArrowRight';

	} else {
		canIgnore = e.button !== 0;
	}

	if (canIgnore) {
		return;
	}

	if (isKeyboardEvent || unsafe.mods.focused !== 'true') {
		e.preventDefault();

		if (isKeyboardEvent) {
			modifySelectionPos();

		} else {
			input.focus();
		}

	} else {
		unsafe.async.setTimeout(modifySelectionPos, 0, {label: $$.setCursor});
	}

	function modifySelectionPos(): void {
		const
			mask = unsafe.compiledMask;

		const canIgnore =
			mask == null ||
			!Object.isTruly(input);

		if (canIgnore) {
			return;
		}

		const
			maskSymbols = mask!.symbols,
			selectionStart = input.selectionStart ?? 0,
			selectionEnd = input.selectionEnd ?? 0;

		let
			canModifyOriginalPos = true,
			pos: number;

		if (isKeyboardEvent) {
			if (selectionStart !== selectionEnd) {
				pos = isLeftKey ? selectionStart : selectionEnd;

			} else {
				pos = isLeftKey ? selectionStart - 1 : selectionEnd + 1;
			}

		} else {
			pos = selectionStart;
		}

		if (selectionEnd === pos || isKeyboardEvent) {
			while (!Object.isRegExp(maskSymbols[pos])) {
				if (isLeftKey) {
					pos--;

					if (pos <= 0) {
						canModifyOriginalPos = false;
						break;
					}

				} else {
					pos++;

					if (pos >= maskSymbols.length) {
						canModifyOriginalPos = false;
						break;
					}
				}
			}

			if (!canModifyOriginalPos) {
				for (let i = 0; i < maskSymbols.length; i++) {
					if (Object.isRegExp(maskSymbols[i])) {
						pos = i;
						break;
					}
				}
			}

			input.setSelectionRange(pos, pos);
		}
	}
}

/**
 * Handler: there is occur a keypress action on the masked input
 *
 * @param component
 * @param e
 * @emits actionChange(value: V)
 */
export function onKeyPress<C extends iInputText>(component: C, e: KeyboardEvent): void {
	const {
		unsafe,
		unsafe: {$refs: {input}}
	} = component;

	if (!Object.isTruly(input)) {
		return;
	}

	const {
		text,
		compiledMask: mask
	} = unsafe;

	const canIgnore =
		text === '' ||
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

	const
		selectionStart = input.selectionStart ?? 0,
		selectionEnd = input.selectionEnd ?? 0;

	const
		chunks = text.split('');

	let
		maskSymbols = mask!.symbols;

	/*if (unsafe.isMaskInfinite && selectionEnd + 1 === maskSymbols.length) {
		unsafe.maskRepetitions++;
		unsafe.compileMask();
		maskSymbols = unsafe.compiledMask!.symbols;
	}*/

	let
		insert = true,
		range = selectionEnd - selectionStart + 1,
		start = selectionStart,
		inputVal = e.key;

	while (range-- > 0) {
		const
			end = selectionEnd - range;

		let
			maskEl = maskSymbols[end],
			nextMaskEl = '',
			i = end;

		if (insert && !Object.isRegExp(maskEl)) {
			nextMaskEl = maskEl;

			while (!Object.isRegExp(maskSymbols[++i]) && i < maskSymbols.length) {
				nextMaskEl += maskSymbols[i];
			}

			maskEl = maskSymbols[i];
		}

		if (Object.isRegExp(maskEl) && (!insert || maskEl.test(inputVal))) {
			let pos = end + nextMaskEl.length;
			chunks[pos] = inputVal;

			if (insert) {
				pos++;
				start = pos;
				insert = false;
				inputVal = unsafe.maskPlaceholder;
			}
		}
	}

	while (start < maskSymbols.length && !Object.isRegExp(maskSymbols[start])) {
		start++;
	}

	unsafe.text = chunks.join('');
	input.setSelectionRange(start, start);
}
