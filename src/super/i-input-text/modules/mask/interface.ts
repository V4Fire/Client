/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface SyncMaskWithTextOptions {
	/**
	 * Starting position of the masked text to synchronize.
	 * The position should be provided to a Unicode symbol, but not a UTF 16 char.
	 */
	from?: Nullable<number>;

	/**
	 * Ending position of the masked text to synchronize.
	 * The position should be provided to a Unicode symbol, but not a UTF 16 char.
	 */
	to?: Nullable<number>;

	/**
	 * Original text from the input (by default it takes from the DOM node).
	 * The parameter can be provided as a list of Unicode symbols.
	 */
	inputText?: CanArray<string>;

	/**
	 * If true, the cursor position will be preserved to the left bound of selection to synchronize
	 * @default `false`
	 */
	preserveCursor?: boolean;
}

export interface CompiledMask {
	/**
	 * List of symbols of the compiled mask
	 *
	 * @example
	 * ```
	 * // mask = '+%d (%d%d%d)'
	 * ['+', /\d/, ' ', '(', /\d/, /\d/, /\d/, ')']
	 * ```
	 */
	symbols: Array<string | RegExp>;

	/**
	 * List of non-terminal symbols of the compiled mask
	 *
	 * @example
	 * ```
	 * // mask = '+%d (%d%d%d)'
	 * [/\d/, /\d/, /\d/, /\d/]
	 * ```
	 */
	nonTerminals: RegExp[];

	/**
	 * Value of the whole mask placeholder
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
	 * Last value of the masked input
	 */
	text: string;

	/**
	 * Starting position of the last input selection.
	 * The position refers to a Unicode symbol, but not a UTF 16 char.
	 */
	start: Nullable<number>;

	/**
	 * Ending position of the last input selection.
	 * The position refers to a Unicode symbol, but not a UTF 16 char.
	 */
	end: Nullable<number>;
}
