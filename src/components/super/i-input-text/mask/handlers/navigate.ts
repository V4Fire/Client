/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type Mask from 'components/super/i-input-text/mask/class';

import { getNormalizedSelectionBounds } from 'components/super/i-input-text/mask/normalizers';
import { convertCursorPositionToRaw } from 'components/super/i-input-text/mask/helpers';

const
	$$ = symbolGenerator();

/**
 * Handler: "navigation" over the mask via "arrow" buttons or click events
 * @param e
 */
export function onNavigate(this: Mask, e: KeyboardEvent | MouseEvent): void {
	let canIgnore =
		e.altKey ||
		e.shiftKey ||
		e.ctrlKey ||
		e.metaKey;

	if (canIgnore) {
		return;
	}

	const {
		ctx: {$refs: {input}}
	} = this;

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
		modifySelectionPos.call(this);

	} else {
		this.async.setTimeout(modifySelectionPos.bind(this), 0, {label: $$.setCursor});
	}

	function modifySelectionPos(this: Mask): void {
		const
			mask = this.compiledMask;

		const canIgnore =
			mask == null ||
			!Object.isTruly(input);

		if (canIgnore) {
			return;
		}

		const
			maskSymbols = mask.symbols;

		const [selectionStart, selectionEnd]: ReturnType<typeof getNormalizedSelectionBounds> =
			getNormalizedSelectionBounds.call(this);

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

		cursorPos = convertCursorPositionToRaw.call(this, cursorPos);
		input.setSelectionRange(cursorPos, cursorPos);
	}
}
