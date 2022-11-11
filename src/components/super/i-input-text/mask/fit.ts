/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Mask from 'components/super/i-input-text/mask/class';

import { compile } from 'components/super/i-input-text/mask/compile';
import type { CompiledMask } from 'components/super/i-input-text/interface';

/**
 * Takes the specified text, and:
 *
 * 1. If its length is greater than the component mask can accommodate, attempts to expand the mask.
 * 2. If its length is less than the mask empty placeholders, attempts to fit the mask.
 *
 * @param text - the string to apply to the mask or an iterable of symbols
 */
export function fitForText(this: Mask, text: CanIter<string>): CanNull<CompiledMask> {
	const {
		ctx: {
			maskPlaceholder,
			maskRepetitionsProp
		},

		compiledMask,
		maskRepetitions
	} = this;

	if (compiledMask == null) {
		return null;
	}

	if (maskRepetitionsProp == null || maskRepetitionsProp === false) {
		return compiledMask;
	}

	const {
		symbols,
		nonTerminals
	} = compiledMask;

	const
		nonTerminalsPerChunk = nonTerminals.length / maskRepetitions;

	let
		i = 0,
		nonTerminalPos = 0;

	let
		validCharsInText = 0,
		vacantCharsInText = 0;

	for (const char of (Object.isString(text) ? text.letters() : text)) {
		const
			maskNonTerminal = nonTerminals[nonTerminalPos];

		if (Object.isRegExp(symbols[i]) && char === maskPlaceholder) {
			vacantCharsInText++;
			incNonTerminalPos();

		} else if (maskNonTerminal.test(char)) {
			validCharsInText += vacantCharsInText + 1;
			vacantCharsInText = 0;
			incNonTerminalPos();
		}

		i++;
	}

	const
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		expectedRepetitions = Math.ceil(validCharsInText / nonTerminalsPerChunk) || 1;

	if (expectedRepetitions === maskRepetitions) {
		return compiledMask;
	}

	if (maskRepetitionsProp === true) {
		this.maskRepetitions = expectedRepetitions;

	} else {
		this.maskRepetitions = maskRepetitionsProp >= expectedRepetitions ? expectedRepetitions : maskRepetitionsProp;
	}

	const
		newMask = compile.call(this);

	if (newMask != null) {
		const
			symbolsInNewMask = newMask.symbols.length,
			diff = compiledMask.symbols.length - newMask.symbols.length;

		newMask.text = [...compiledMask.text.letters()]
			.slice(0, symbolsInNewMask)
			.join('');

		newMask.selectionStart = compiledMask.selectionStart;
		newMask.selectionEnd = compiledMask.selectionEnd;

		if (diff > 0) {
			if (newMask.selectionStart != null && newMask.selectionStart > symbolsInNewMask) {
				newMask.selectionStart -= diff;
			}

			if (newMask.selectionEnd != null && newMask.selectionEnd > symbolsInNewMask) {
				newMask.selectionEnd -= diff;
			}
		}
	}

	return newMask;

	function incNonTerminalPos(): void {
		if (nonTerminalPos < nonTerminals.length - 1) {
			nonTerminalPos++;

		} else {
			nonTerminalPos = 0;
		}
	}
}
