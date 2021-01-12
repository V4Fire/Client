/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInputText, { CompiledMask } from 'super/i-input-text/i-input-text';

/**
 * Takes the specified text, and if its length more than the component mask can accommodate, tries to expand the mask
 *
 * @param component
 * @param text
 */
export function fitForText<C extends iInputText>(component: C, text: string): CanUndef<CompiledMask> {
	const {
		unsafe,
		unsafe: {compiledMask: mask}
	} = component;

	if (mask == null || unsafe.maskRepetitionsProp !== true) {
		return;
	}

	const
		{nonTerminals} = mask!;

	let
		i = 0,
		validCharsInText = 0;

	for (const char of text.letters()) {
		const
			maskNonTerminal = nonTerminals[i];

		if (maskNonTerminal.test(char)) {
			validCharsInText++;

			if (i < nonTerminals.length - 1) {
				i++;

			} else {
				i = 0;
			}
		}
	}

	if (nonTerminals.length > validCharsInText) {
		return;
	}

	const
		diff = validCharsInText - nonTerminals.length,
		nonTerminalsPerChunk = nonTerminals.length / unsafe.maskRepetitions;

	unsafe.maskRepetitions += Math.floor(diff / nonTerminalsPerChunk);
	return unsafe.compileMask();
}

/**
 * Sets a position of the selection cursor at the first non-terminal symbol from the mask
 * @param component
 */
export async function setCursorPositionAtFirstNonTerminal<C extends iInputText>(component: C): Promise<void> {
	const {
		unsafe,
		unsafe: {compiledMask: mask}
	} = component;

	if (mask == null) {
		return;
	}

	if (unsafe.mods.empty === 'true') {
		await unsafe.syncMaskWithText('');
	}

	let
		pos = 0;

	for (let o = mask!.symbols, i = 0; i < o.length; i++) {
		if (Object.isRegExp(o[i])) {
			pos = i;
			break;
		}
	}

	unsafe.$refs.input.setSelectionRange(pos, pos);
}

/**
 * Saves a snapshot of the masked input
 * @param component
 */
export function saveSnapshot<C extends iInputText>(component: C): void {
	const {
		compiledMask: mask,
		$refs: {input}
	} = component.unsafe;

	if (mask == null) {
		return;
	}

	mask!.text = component.text;

	if (Object.isTruly(input)) {
		mask!.start = input.selectionStart;
		mask!.end = input.selectionEnd;
	}
}

/**
 * Synchronizes the `$refs.input.text` property with the `text` field
 * @param component
 */
export function syncInputWithField<C extends iInputText>(component: C): void {
	const {
		unsafe,
		unsafe: {$refs: {input}}
	} = component;

	if (unsafe.compiledMask == null || !Object.isTruly(input)) {
		return;
	}

	input.value = unsafe.text;
}

/**
 * Synchronizes the `text` field with the `$refs.input.text` property
 * @param component
 */
export function syncFieldWithInput<C extends iInputText>(component: C): void {
	const {
		unsafe,
		unsafe: {compiledMask: mask}
	} = component;

	unsafe.async.setImmediate(() => {
		const
			{input} = unsafe.$refs;

		if (!Object.isTruly(input)) {
			return;
		}

		void unsafe.syncMaskWithText(input.value, {
			start: mask?.start,
			end: mask?.end
		});
	});
}
