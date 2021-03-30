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

	if (isKeyboardEvent) {
		e.preventDefault();
		modifySelectionPos();

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
						break;
					}

				} else {
					pos++;

					if (pos >= maskSymbols.length) {
						break;
					}
				}
			}

			input.setSelectionRange(pos, pos);
		}
	}
}
