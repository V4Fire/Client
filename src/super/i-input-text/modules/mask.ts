/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iInputText from 'super/i-input-text/i-input-text';

export const
	$$ = symbolGenerator();

/**
 * Sets a position of the selection cursor at the first non-terminal symbol from the mask
 * @param component
 */
export async function setCursorPositionAtFirstNonTerminal<C extends iInputText>(component: C): Promise<void> {
	const
		{unsafe} = component;

	if (unsafe.mods.empty === 'true') {
		await unsafe.applyMaskToText('');
	}

	const
		mask = unsafe.compiledMask;

	if (mask == null) {
		return;
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

	unsafe.async.setImmediate(() => unsafe.applyMaskToText(unsafe.$refs.input.value, {
		start: mask?.start,
		end: mask?.end
	}));
}

/**
 * Handler: removing characters from the mask via "backspace/delete" buttons
 *
 * @param component
 * @param e
 */
export async function onMaskDelete<C extends iInputText>(component: C, e: KeyboardEvent): Promise<void> {
	const codes = {
		Backspace: true,
		Delete: true
	};

	if (codes[e.key] == null) {
		return;
	}

	e.preventDefault();

	const {
		unsafe,
		unsafe: {$refs: {input}}
	} = component;

	if (!Object.isTruly(input)) {
		return;
	}

	const
		selectionStart = input.selectionStart ?? 0,
		selectionEnd = input.selectionEnd ?? 0,
		withoutSelection = selectionStart === selectionEnd;

	const
		mask = unsafe.compiledMask,
		maskSymbols = mask?.symbols;

	if (mask == null || maskSymbols == null) {
		return;
	}

	let
		{text} = unsafe;

	let
		pos = 0;

	if (e.key === 'Delete') {
		const
			chunks = <string[]>[];

		let
			start = selectionStart,
			end = selectionEnd;

		for (let i = 0; i < maskSymbols.length; i++) {
			const
				symbol = maskSymbols[i],
				char = text[i];

			if (Object.isRegExp(symbol) && symbol.test(char)) {
				chunks.push(char);

			} else {
				if (i < selectionStart) {
					start--;
				}

				if (!withoutSelection && i < selectionEnd) {
					end--;
				}
			}
		}

		chunks.splice(start, withoutSelection ? 1 : end - start);
		text = chunks.join('');

		if (text !== '') {
			await unsafe.applyMaskToText(text, {
				start: selectionStart,
				end: selectionEnd,
				maskText: ''
			});

		} else {
			await unsafe.applyMaskToText('');
		}

		return;
	}

	const
		chunks = text.split('');

	let range = selectionEnd - selectionStart;
	range = range > 0 ? range : 1;

	while (range-- > 0) {
		const
			end = selectionEnd - range - 1;

		let
			maskEl = maskSymbols[end],
			prevMaskEl = '',
			i = end;

		if (!Object.isRegExp(maskEl) && withoutSelection) {
			prevMaskEl = maskEl;

			while (!Object.isRegExp(maskSymbols[--i]) && i > -1) {
				prevMaskEl += maskSymbols[i];
			}

			maskEl = maskSymbols[i];
		}

		if (Object.isRegExp(maskEl)) {
			pos = end - prevMaskEl.length;
			chunks[pos] = unsafe.maskPlaceholder;
		}
	}

	text = chunks.join('');

	let
		start = withoutSelection ? pos : selectionStart;

	while (start < maskSymbols.length && !Object.isRegExp(maskSymbols[start])) {
		start++;
	}

	if (text === mask!.placeholder) {
		await unsafe.applyMaskToText('');

	} else {
		unsafe.text = text;
		input.setSelectionRange(start, start);
	}
}

/**
 * Handler: "navigation" over the mask via "arrow" buttons or click events
 *
 * @param component
 * @param e
 */
export function onMaskNavigate<C extends iInputText>(component: C, e: KeyboardEvent | MouseEvent): void {
	if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
		return;
	}

	const {
		unsafe,
		unsafe: {$refs: {input}}
	} = component;

	const
		isKeyboardEvent = e instanceof KeyboardEvent,
		isLeftKey = (<KeyboardEvent>e).key === 'ArrowLeft';

	if (isKeyboardEvent ? !isLeftKey && (<KeyboardEvent>e).key !== 'ArrowRight' : (<MouseEvent>e).button !== 0) {
		return;
	}

	if (isKeyboardEvent || unsafe.mods.focused !== 'true') {
		e.preventDefault();

		if (isKeyboardEvent) {
			modifyPos();

		} else {
			input.focus();
		}

	} else {
		unsafe.async.setTimeout(modifyPos, 0, {label: $$.setCursor});
	}

	function modifyPos(): void {
		const
			mask = unsafe.compiledMask;

		if (mask == null) {
			return;
		}

		const
			maskSymbols = mask!.symbols;

		if (!Object.isTruly(input)) {
			return;
		}

		const
			selectionStart = input.selectionStart ?? 0,
			selectionEnd = input.selectionEnd ?? 0;

		let
			canModifyOriginalPos = true,
			pos: number;

		if (isKeyboardEvent) {
			if (selectionStart !== selectionEnd) {
				pos = isLeftKey ? selectionStart : selectionEnd;

			} else {
				pos = isLeftKey ? selectionStart - 1 : selectionEnd + 1;
			}

		} else {
			pos = selectionStart;
		}

		if (selectionEnd === pos || isKeyboardEvent) {
			while (!Object.isRegExp(maskSymbols[pos])) {
				if (isLeftKey) {
					pos--;

					if (pos <= 0) {
						canModifyOriginalPos = false;
						break;
					}

				} else {
					pos++;

					if (pos >= maskSymbols.length) {
						canModifyOriginalPos = false;
						break;
					}
				}
			}

			if (!canModifyOriginalPos) {
				for (let i = 0; i < maskSymbols.length; i++) {
					if (Object.isRegExp(maskSymbols[i])) {
						pos = i;
						break;
					}
				}
			}

			input.setSelectionRange(pos, pos);
		}
	}
}

/**
 * Handler: there is occur a keypress action on the masked input
 *
 * @param component
 * @param e
 * @emits actionChange(value: V)
 */
export function onMaskKeyPress<C extends iInputText>(component: C, e: KeyboardEvent): void {
	const
		{unsafe} = component;

	const blacklist = {
		Tab: true
	};

	const
		{text, compiledMask} = unsafe;

	const isIgnoredKeypress =
		e.altKey ||
		e.shiftKey ||
		e.ctrlKey ||
		e.metaKey ||
		blacklist[e.key] === true;

	if (isIgnoredKeypress || text === '' || compiledMask == null) {
		return;
	}

	e.preventDefault();

	const
		{input} = unsafe.$refs;

	if (!Object.isTruly(input)) {
		return;
	}

	const
		selectionStart = input.selectionStart ?? 0,
		selectionEnd = input.selectionEnd ?? 0;

	const
		chunks = text.split(''),
		maskSymbols = compiledMask!.symbols;

	let
		insert = true,
		range = selectionEnd - selectionStart + 1,
		start = selectionStart,
		inputVal = e.key;

	while (range-- > 0) {
		const
			end = selectionEnd - range;

		let
			maskEl = maskSymbols[end],
			nextMaskEl = '',
			i = end;

		if (insert && !Object.isRegExp(maskEl)) {
			nextMaskEl = maskEl;

			while (!Object.isRegExp(maskSymbols[++i]) && i < maskSymbols.length) {
				nextMaskEl += maskSymbols[i];
			}

			maskEl = maskSymbols[i];
		}

		if (Object.isRegExp(maskEl) && (!insert || maskEl.test(inputVal))) {
			let pos = end + nextMaskEl.length;
			chunks[pos] = inputVal;

			if (insert) {
				pos++;
				start = pos;
				insert = false;
				inputVal = unsafe.maskPlaceholder;
			}
		}
	}

	while (start < maskSymbols.length && !Object.isRegExp(maskSymbols[start])) {
		start++;
	}

	unsafe.text = chunks.join('');
	input.setSelectionRange(start, start);
	input.setSelectionRange(start, start);

	if (unsafe.isMaskInfinite && selectionEnd + 1 === maskSymbols.length) {
		unsafe.maskRepeat *= 2;
		void unsafe.initMask();
		input.setSelectionRange(start + 1, start + 1);
	}
}
