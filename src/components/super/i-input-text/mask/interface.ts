/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface SyncMaskWithTextOptions {
	/**
	 * The starting position of the masked text to synchronize.
	 * The position points to a symbol in a list of unicode graphemes, not a UTF-16 string.
	 */
	from?: Nullable<number>;

	/**
	 * The ending position of the masked text to synchronize.
	 * The position points to a symbol in a list of unicode graphemes, not a UTF-16 string.
	 */
	to?: Nullable<number>;

	/**
	 * The original text from the input (by default it takes from the DOM node).
	 * The parameter can be provided as an iterable of Unicode symbols.
	 */
	inputText?: CanIter<string>;

	/**
	 * If false, the mask will not attempt to fit its size to the specified text
	 * @default `true`
	 */
	fitMask?: boolean;

	/**
	 * The starting position of the selection cursor.
	 * The position points to a symbol in a list of unicode graphemes, not a UTF-16 string.
	 *
	 * @default `from`
	 */
	cursorPos?: number;

	/**
	 * If true, the cursor position will be preserved to the left bound of the selection
	 * @default `false`
	 */
	preserveCursor?: boolean;

	/**
	 * If true, all symbols from the specified text that are matched as mask placeholders won't be skipped
	 * @default `false`
	 */
	preservePlaceholders?: boolean;
}

export interface CompiledMask {
	/**
	 * A list of the compiled mask symbols
	 *
	 * @example
	 * ```
	 * // mask = '+%d (%d%d%d)'
	 * ['+', /\d/, ' ', '(', /\d/, /\d/, /\d/, ')']
	 * ```
	 */
	symbols: Array<string | RegExp>;

	/**
	 * A list of non-terminal symbols from the compiled mask
	 *
	 * @example
	 * ```
	 * // mask = '+%d (%d%d%d)'
	 * [/\d/, /\d/, /\d/, /\d/]
	 * ```
	 */
	nonTerminals: RegExp[];

	/**
	 * Last value of the masked input
	 */
	text: string;

	/**
	 * The placeholder value of the entire mask
	 *
	 * @example
	 * ```
	 * // mask = '+%d (%d%d%d) %d%d%d-%d%d-%d%d'
	 * // maskPlaceholder = '_'
	 * '+_ (___) ___-__-__'
	 * ```
	 */
	placeholder: string;

	/**
	 * The starting position of the last input selection.
	 * The position refers to a Unicode grapheme list, but not a UTF-16 string.
	 */
	selectionStart: Nullable<number>;

	/**
	 * The ending position of the last input selection.
	 * The position refers to a Unicode grapheme list, but not a UTF-16 string.
	 */
	selectionEnd: Nullable<number>;
}
