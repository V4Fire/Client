/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInputText, { CompiledMask } from 'super/i-input-text/i-input-text';

/**
 * Compiles the specified component mask and returns it
 *
 * @param component
 * @param mask
 */
export function compile<C extends iInputText>(component: C, mask: string): CompiledMask {
	const {
		unsafe,
		unsafe: {maskRepeat, maskPlaceholder, maskDelimiter}
	} = component;

	const
		symbols = <Array<string | RegExp>>[],
		nonTerminals = <RegExp[]>[];

	let
		placeholder = '',
		isNonTerminal = false;

	for (let o = [...mask], i = 0, j = 0; i < o.length && j < maskRepeat; i++) {
		const
			char = o[i];

		if (char === '%') {
			isNonTerminal = true;
			continue;
		}

		placeholder += isNonTerminal ? maskPlaceholder : char;

		if (isNonTerminal) {
			const
				symbol = unsafe.regExps?.[char] ?? new RegExp(`\\${char}`);

			symbols.push(symbol);
			nonTerminals.push(symbol);

			isNonTerminal = false;

		} else {
			symbols.push(char);
		}

		if (i === o.length - 1) {
			i = -1;
			j++;

			if (j < maskRepeat) {
				placeholder += maskDelimiter;
				symbols.push(maskDelimiter);
			}
		}
	}

	return {
		symbols,
		nonTerminals,
		placeholder,
		text: '',
		start: 0,
		end: 0
	};
}
