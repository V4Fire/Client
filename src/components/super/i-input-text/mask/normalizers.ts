/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Mask from 'components/super/i-input-text/mask/class';

/**
 * Returns the normalized selection position of the passed component.
 * The function converts the original selection bounds from UTF-16 characters to Unicode graphemes.
 *
 * @param [selectionStart] - the raw selection start bound (if not specified, it will be taken from the node)
 * @param [selectionEnd] - the raw selection end bound (if not specified, it will be taken from the node)
 *
 * @example
 * ```
 * // '1-😀'
 * getNormalizedSelectionBounds(component, 2, 4) // [2, 3], cause "😀" is contained two UTF-16 characters
 * ```
 */
export function getNormalizedSelectionBounds(
	this: Mask,
	selectionStart?: number,
	selectionEnd?: number
): [number, number] {
	const {
		ctx: {
			text,
			$refs: {input}
		}
	} = this;

	selectionStart = selectionStart ?? input.selectionStart ?? 0;
	selectionEnd = selectionEnd ?? input.selectionEnd ?? 0;

	let
		normalizedSelectionStart = selectionStart,
		normalizedSelectionEnd = selectionEnd;

	{
		const
			slicedText = text.slice(0, selectionStart),
			slicedTextChunks = [...slicedText.letters()];

		if (slicedText.length > slicedTextChunks.length) {
			normalizedSelectionStart -= slicedText.length - slicedTextChunks.length;
		}
	}

	{
		const
			slicedText = text.slice(0, selectionEnd),
			slicedTextChunks = [...slicedText.letters()];

		if (slicedText.length > slicedTextChunks.length) {
			normalizedSelectionEnd -= slicedText.length - slicedTextChunks.length;
		}
	}

	return [normalizedSelectionStart, normalizedSelectionEnd];
}
