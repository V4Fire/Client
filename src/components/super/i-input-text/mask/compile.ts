/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Mask from 'components/super/i-input-text/mask/class';
import type { CompiledMask } from 'components/super/i-input-text/mask/interface';

/**
 * Compiles the specified component mask and returns the compiled object.
 *
 * To determine non-terminal symbols within the mask is used the symbol `%` and the symbol after it, like `%d` or `%w`.
 * The character `%` is replaced to `\`, and after, the expression will be compiled to RegExp.
 * To escape system characters, you can use a backslash, such as `\\%d`.
 *
 * @param [mask]
 */
export function compile(this: Mask, mask: Nullable<string> = this.ctx.mask): CanNull<CompiledMask> {
	if (mask == null) {
		return null;
	}

	const {
		ctx: {
			regExps,
			maskPlaceholder,
			maskDelimiter
		},

		maskRepetitions
	} = this;

	const
		symbols: Array<string | RegExp> = [],
		nonTerminals: RegExp[] = [];

	let
		placeholder = '';

	let
		needEscape = false,
		isNonTerminal = false;

	for (let o = [...mask.letters()], i = 0, j = 0; i < o.length && j < maskRepetitions; i++) {
		const
			char = o[i];

		if (!needEscape) {
			if (char === '\\') {
				needEscape = true;
				continue;
			}

			if (char === '%') {
				isNonTerminal = true;
				continue;
			}
		}

		needEscape = false;
		placeholder += isNonTerminal ? maskPlaceholder : char;

		if (isNonTerminal) {
			const
				symbol = regExps?.[char] ?? new RegExp(`\\${char}`);

			symbols.push(symbol);
			nonTerminals.push(symbol);

			isNonTerminal = false;

		} else {
			symbols.push(char);
		}

		if (i === o.length - 1) {
			i = -1;
			j++;

			if (j < maskRepetitions && maskDelimiter !== '') {
				placeholder += maskDelimiter;
				symbols.push(maskDelimiter);
			}
		}
	}

	const compiledMask = {
		symbols,
		nonTerminals,

		text: '',
		placeholder,

		selectionStart: 0,
		selectionEnd: 0
	};

	this.compiledMask = compiledMask;
	return compiledMask;
}
