/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface ApplyMaskToValueOptions {
	/**
	 * Which component property should be updated
	 * @default `'text'`
	 */
	update?: 'text' | 'textBuffer';

	/**
	 * Start index of the position to update
	 */
	start?: Nullable<number>;

	/**
	 * End index of the position to update
	 */
	end?: Nullable<number>;

	/**
	 * Cursor position
	 */
	cursor?: Nullable<number | 'start'>;

	/**
	 * Value of the buffer to apply
	 */
	buffer?: string;
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
}
