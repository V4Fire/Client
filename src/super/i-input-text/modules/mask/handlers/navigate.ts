/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from '~/core/symbol';

import type iInputText from '~/super/i-input-text/i-input-text';
import { convertCursorPositionToRaw, getNormalizedSelectionBounds } from '~/super/i-input-text/modules/mask/helpers';

export const
	$$ = symbolGenerator();

/**
 * Handler: "navigation" over the mask via "arrow" buttons or click events
 *
 * @param component
 * @param e
 */
export function onNavigate<C extends iInputText>(component: C, e: KeyboardEvent | MouseEvent): boolean {
	let canIgnore =
		e.altKey ||
		e.shiftKey ||
		e.ctrlKey ||
		e.metaKey;

	if (canIgnore) {
		return false;
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
		return false;
	}

	if (isKeyboardEvent) {
		e.preventDefault();
		modifySelectionPos();

	} else {
		unsafe.async.setTimeout(modifySelectionPos, 0, {label: $$.setCursor});
	}

	return true;

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
			maskSymbols = mask.symbols;

		const
			[selectionStart, selectionEnd] = getNormalizedSelectionBounds(component);

		let
			cursorPos: number;

		if (isKeyboardEvent) {
			if (selectionStart !== selectionEnd) {
				cursorPos = isLeftKey ? selectionStart : selectionEnd;

			} else {
				cursorPos = isLeftKey ? selectionStart - 1 : selectionEnd + 1;
			}

		} else {
			cursorPos = selectionStart;
		}

		if (!isKeyboardEvent && cursorPos !== selectionEnd) {
			return;
		}

		while (!Object.isRegExp(maskSymbols[cursorPos])) {
			if (isLeftKey) {
				cursorPos--;

				if (cursorPos <= 0) {
					cursorPos = 0;
					break;
				}

			} else {
				cursorPos++;

				if (cursorPos >= maskSymbols.length) {
					cursorPos = maskSymbols.length;
					break;
				}
			}
		}

		cursorPos = convertCursorPositionToRaw(component, cursorPos);
		input.setSelectionRange(cursorPos, cursorPos);
	}
}
