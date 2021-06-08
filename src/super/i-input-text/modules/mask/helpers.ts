/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { $$ } from 'super/i-input-text/const';

import type iInputText from 'super/i-input-text/i-input-text';
import type { CompiledMask } from 'super/i-input-text/interface';

/**
 * Takes the specified text, and:
 *
 * * If its length more than the component mask can accommodate, tries to expand the mask.
 * * If its length less than the vacant mask placeholders, tries to fit the mask.
 *
 * @param component
 * @param text - string to apply to the mask or an array of symbols
 */
export function fitForText<C extends iInputText>(component: C, text: CanArray<string>): CanUndef<CompiledMask> {
	const {
		unsafe,
		unsafe: {
			compiledMask: mask,
			maskRepetitionsProp,
			maskRepetitions
		}
	} = component;

	if (mask == null) {
		return;
	}

	if (maskRepetitionsProp == null || maskRepetitionsProp === false) {
		return mask;
	}

	const
		{symbols, nonTerminals} = mask!;

	const
		nonTerminalsPerChunk = nonTerminals.length / maskRepetitions;

	let
		i = 0,
		nonTerminalPos = 0;

	let
		validCharsInText = 0,
		vacantCharsInText = 0;

	for (const char of (Object.isArray(text) ? text : text.letters())) {
		const
			maskNonTerminal = nonTerminals[nonTerminalPos];

		if (Object.isRegExp(symbols[i]) && char === unsafe.maskPlaceholder) {
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
		return mask;
	}

	if (maskRepetitionsProp === true) {
		unsafe.maskRepetitions = expectedRepetitions;

	} else {
		unsafe.maskRepetitions = maskRepetitionsProp >= expectedRepetitions ? expectedRepetitions : maskRepetitionsProp;
	}

	const
		newMask = unsafe.compileMask();

	if (newMask != null) {
		const
			symbolsInNewMask = newMask.symbols.length,
			diff = mask!.symbols.length - newMask.symbols.length;

		newMask.text = [...mask!.text.letters()]
			.slice(0, symbolsInNewMask)
			.join('');

		newMask.selectionStart = mask!.selectionStart;
		newMask.selectionEnd = mask!.selectionEnd;

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

/**
 * Saves a snapshot of the masked input
 * @param component
 */
export function saveSnapshot<C extends iInputText>(component: C): boolean {
	const {
		compiledMask: mask,
		$refs: {input}
	} = component.unsafe;

	if (mask == null) {
		return false;
	}

	mask!.text = component.text;

	const
		rawSelectionStart = input.selectionStart ?? 0,
		rawSelectionEnd = input.selectionEnd ?? 0;

	if (Object.isTruly(input)) {
		if (rawSelectionStart === 0 && rawSelectionEnd === input.value.length) {
			Object.assign(mask, {
				selectionStart: 0,
				selectionEnd: 0
			});

		} else {
			const [selectionStart, selectionEnd] = getNormalizedSelectionBounds(
				component,
				rawSelectionStart,
				rawSelectionEnd
			);

			Object.assign(mask, {selectionStart, selectionEnd});
		}
	}

	return true;
}

/**
 * Sets a position of the selection cursor at the first non-terminal symbol from the mask
 * @param component
 */
export function setCursorPositionAtFirstNonTerminal<C extends iInputText>(component: C): boolean {
	const {
		unsafe,
		unsafe: {compiledMask: mask}
	} = component;

	if (mask == null) {
		return false;
	}

	if (unsafe.mods.empty === 'true') {
		void unsafe.syncMaskWithText('');
	}

	let
		pos = 0;

	for (let o = mask!.symbols, i = 0; i < o.length; i++) {
		if (Object.isRegExp(o[i])) {
			pos = i;
			break;
		}
	}

	pos = convertCursorPositionToRaw(component, pos);
	unsafe.$refs.input.setSelectionRange(pos, pos);
	return true;
}

/**
 * Synchronizes the `$refs.input.text` property with the `text` field
 * @param component
 */
export function syncInputWithField<C extends iInputText>(component: C): boolean {
	const {
		unsafe,
		unsafe: {$refs: {input}}
	} = component;

	if (unsafe.compiledMask == null || !Object.isTruly(input)) {
		return false;
	}

	input.value = unsafe.text;
	return true;
}

/**
 * Synchronizes the `text` field with the `$refs.input.text` property
 * @param component
 */
export function syncFieldWithInput<C extends iInputText>(component: C): Promise<boolean> {
	const {
		unsafe,
		unsafe: {compiledMask: mask}
	} = component;

	return unsafe.async.nextTick({label: $$.syncFieldWithInput}).then(async () => {
		const
			{$refs: {input}} = unsafe;

		if (mask == null || !Object.isTruly(input)) {
			return false;
		}

		const
			{symbols: maskSymbols} = mask!;

		const
			from = mask!.selectionStart ?? 0,
			to = mask!.selectionEnd ?? maskSymbols.length,
			normalizedTo = from === to ? to + 1 : to;

		if (from === 0 || to >= maskSymbols.length) {
			await unsafe.syncMaskWithText(input.value);
			return false;
		}

		const
			originalTextChunks = [...unsafe.text.letters()],
			textChunks = [...input.value.letters()].slice(from, normalizedTo);

		for (let i = from, j = 0; i < normalizedTo; i++, j++) {
			const
				char = textChunks[j],
				maskEl = maskSymbols[i];

			if (Object.isRegExp(maskEl)) {
				if (!maskEl.test(char)) {
					textChunks[j] = unsafe.maskPlaceholder;
				}

			} else {
				textChunks[j] = originalTextChunks[i];
			}
		}

		const
			textTail = normalizedTo >= maskSymbols.length ? '' : originalTextChunks.slice(normalizedTo),
			textToSync = textChunks.concat(textTail);

		await unsafe.syncMaskWithText(textToSync, {
			from,
			fitMask: false,
			cursorPos: to,
			preserveCursor: true,
			preservePlaceholders: true
		});

		return true;
	});
}

/**
 * Returns the normalized selection position of the passed component.
 * The function converts the original selection bounds from UTF 16 characters to Unicode graphemes.
 *
 * @param component
 * @param [selectionStart] - raw selection start bound (if not specified, it will be taken from the node)
 * @param [selectionEnd] - raw selection end bound (if not specified, it will be taken from the node)
 *
 * @example
 * ```
 * // '1-😀'
 * getNormalizedSelectionBounds(component, 2, 4) // [2, 3], cause "😀" is contained two UTF 16 characters
 * ```
 */
export function getNormalizedSelectionBounds<C extends iInputText>(
	component: C,
	selectionStart?: number,
	selectionEnd?: number
): [number, number] {
	const {
		text,
		$refs: {input}
	} = component.unsafe;

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

/**
 * Takes a position of the selection cursor and returns its value within a UTF 16 string
 *
 * @param component
 * @param pos
 *
 * @example
 * ```
 * // '1-😀'
 * convertCursorPositionToRaw(component, 3) // 4, cause "😀" is contained two UTF 16 characters
 * ```
 */
export function convertCursorPositionToRaw<C extends iInputText>(component: C, pos: number): number {
	const {text} = component;
	return [...text.letters()].slice(0, pos).join('').length;
}
