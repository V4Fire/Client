/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';
import type { CompiledMask } from 'super/i-input-text/i-input-text';

/**
 * Takes the specified text, and if its length more than the component mask can accommodate, tries to expand the mask
 *
 * @param component
 * @param text
 */
export function fitForText<C extends iInputText>(component: C, text: CanArray<string>): CanUndef<CompiledMask> {
	const {
		unsafe,
		unsafe: {compiledMask: mask}
	} = component;

	if (mask == null) {
		return;
	}

	if (unsafe.maskRepetitionsProp !== true) {
		return mask;
	}

	const
		{nonTerminals} = mask!;

	let
		i = 0,
		validCharsInText = 0,
		vacantCharsInText = 0;

	for (const char of (Object.isArray(text) ? text : text.letters())) {
		const
			maskNonTerminal = nonTerminals[i];

		if (char === unsafe.maskPlaceholder) {
			vacantCharsInText++;
			incI();

		} else if (maskNonTerminal.test(char)) {
			validCharsInText += vacantCharsInText + 1;
			vacantCharsInText = 0;
			incI();
		}
	}

	const
		nonTerminalsPerChunk = nonTerminals.length / unsafe.maskRepetitions,

		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		expectedRepetitions = Math.ceil(validCharsInText / nonTerminalsPerChunk) || 1;

	if (expectedRepetitions === unsafe.maskRepetitions) {
		return mask;
	}

	unsafe.maskRepetitions = expectedRepetitions;
	return unsafe.compileMask();

	function incI(): void {
		if (i < nonTerminals.length - 1) {
			i++;

		} else {
			i = 0;
		}
	}
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
		if (input.selectionStart === 0 && input.selectionEnd === input.value.length) {
			Object.assign(mask, {
				start: 0,
				end: 0
			});

		} else {
			Object.assign(mask, {
				start: input.selectionStart,
				end: input.selectionEnd
			});
		}
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
			from: mask?.start,
			to: mask?.end
		});
	});
}
