/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { UnsafeIInput } from 'super/i-input/i-input';
import type iInputText from 'super/i-input-text/i-input-text';

export interface SyncMaskWithTextOptions {
	/**
	 * Starting position of the masked text to synchronize
	 */
	from?: Nullable<number>;

	/**
	 * Ending position of the masked text to synchronize
	 */
	to?: Nullable<number>;

	/**
	 * Original text from the input (by default it takes from the DOM node)
	 */
	inputText?: string;
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
	 * Value of the masked input
	 */
	text: string;

	/**
	 * Start position of the last input selection
	 */
	start: Nullable<number>;

	/**
	 * End position of the last input selection
	 */
	end: Nullable<number>;
}

// @ts-ignore (extend)
export interface UnsafeIInputText<CTX extends iInputText = iInputText> extends UnsafeIInput<CTX> {
	// @ts-ignore (access)
	updateTextStore: CTX['updateTextStore'];

	// @ts-ignore (access)
	maskRepetitions: CTX['maskRepetitions'];

	// @ts-ignore (access)
	compiledMask: CTX['compiledMask'];

	// @ts-ignore (access)
	initMask: CTX['initMask'];

	// @ts-ignore (access)
	compileMask: CTX['compileMask'];

	// @ts-ignore (access)
	syncMaskWithText: CTX['syncMaskWithText'];
}
