/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { UnsafeIInput } from 'super/i-input/i-input';
import iInputText from 'super/i-input-text/i-input-text';

export interface ApplyMaskToTextOptions {
	/**
	 * Start position to set off the text selection
	 */
	start?: Nullable<number>;

	/**
	 * End position to set off the text selection
	 */
	end?: Nullable<number>;

	/**
	 * Text value of the masked input
	 */
	maskText?: string;
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
	maskText: CTX['maskText'];

	// @ts-ignore (access)
	compiledMask: CTX['compiledMask'];

	// @ts-ignore (access)
	maskRepeat: CTX['maskRepeat'];

	// @ts-ignore (access)
	lastMaskSelectionStartIndex: CTX['lastMaskSelectionStartIndex'];

	// @ts-ignore (access)
	lastMaskSelectionEndIndex: CTX['lastMaskSelectionEndIndex'];

	// @ts-ignore (access)
	applyMaskToText: CTX['applyMaskToText'];

	// @ts-ignore (access)
	initMask: CTX['initMask'];

	// @ts-ignore (access)
	compileMask: CTX['compileMask'];
}
