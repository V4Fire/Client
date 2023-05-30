/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Mask from 'components/super/i-input-text/mask/class';
import { getNormalizedSelectionBounds } from 'components/super/i-input-text/mask/normalizers';

/**
 * Saves a snapshot of the masked input
 */
export function saveSnapshot(this: Mask): void {
	const {
		ctx: {
			text,
			$refs: {input}
		},

		compiledMask
	} = this;

	if (compiledMask == null) {
		return;
	}

	compiledMask.text = text;

	const
		rawSelectionStart = input.selectionStart ?? 0,
		rawSelectionEnd = input.selectionEnd ?? 0;

	if (Object.isTruly(input)) {
		if (rawSelectionStart === 0 && rawSelectionEnd === input.value.length) {
			Object.assign(compiledMask, {
				selectionStart: 0,
				selectionEnd: 0
			});

		} else {
			const [selectionStart, selectionEnd] = getNormalizedSelectionBounds.call(
				this,
				rawSelectionStart,
				rawSelectionEnd
			);

			Object.assign(compiledMask, {selectionStart, selectionEnd});
		}
	}
}

/**
 * Takes a position of the selection cursor and returns its value within a UTF-16 string
 *
 * @param pos
 *
 * @example
 * ```
 * // '1-😀'
 * convertCursorPositionToRaw(component, 3) // 4, cause "😀" is contained two UTF-16 characters
 * ```
 */
export function convertCursorPositionToRaw(this: Mask, pos: number): number {
	return [...this.ctx.text.letters()].slice(0, pos).join('').length;
}
