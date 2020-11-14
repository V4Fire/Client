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
 * Handler: the input with a mask has got the focus
 * @param component
 */
export async function onMaskFocus<C extends iInputText>(component: C): Promise<void> {
	const
		c = component.unsafe;

	if (c.mods.empty === 'true') {
		await c.applyMaskToText('');
	}

	const
		mask = c.compiledMask;

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

	c.$refs.input.setSelectionRange(pos, pos);
}

/**
 * Handler: the input with a mask has lost the focus
 * @param component
 */
export function onMaskBlur<C extends iInputText>(component: C): void {
	const
		mask = component.unsafe.compiledMask;

	if (mask == null) {
		return;
	}

	if (component.text === mask!.placeholder) {
		component.value = '';
	}
}

/**
 * Handler: cursor position of the input has been changed and can be saved
 * @param component
 */
export function onMaskCursorReady<C extends iInputText>(component: C): void {
	const
		{unsafe, unsafe: {$refs: {input}}} = component;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (input == null) {
		return;
	}

	unsafe.lastMaskSelectionStartIndex = input.selectionStart;
	unsafe.lastMaskSelectionEndIndex = input.selectionEnd;
}

/**
 * Handler: value of the masked input has been changed and can be saved
 * @param component
 */
export function onMaskValueReady<C extends iInputText>(component: C): void {
	component.unsafe.maskText = component.text;
}

/**
 * Handler: there is occur an input action on the masked input
 * @param component
 */
export async function onMaskInput<C extends iInputText>(component: C): Promise<void> {
	const
		c = component.unsafe;

	await c.applyMaskToText(undefined, {
		start: c.lastMaskSelectionStartIndex,
		end: c.lastMaskSelectionEndIndex
	});
}

/**
 * Handler: the "backspace" button has been pressed on the masked input
 *
 * @param component
 * @param e
 */
export async function onMaskBackspace<C extends iInputText>(component: C, e: KeyboardEvent): Promise<void> {
	const codes = {
		Backspace: true,
		Delete: true
	};

	if (codes[e.key] == null) {
		return;
	}

	e.preventDefault();

	const
		{unsafe, unsafe: {$refs: {input}}} = component;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (input == null) {
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
		let
			start = selectionStart,
			end = selectionEnd;

		const
			chunks = <string[]>[];

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
			await unsafe.applyMaskToText(text, {cursor: selectionStart, maskText: ''});

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
 * Handler: one of "arrow" buttons has been pressed on the masked input
 *
 * @param component
 * @param e
 */
export function onMaskNavigate<C extends iInputText>(component: C, e: KeyboardEvent | MouseEvent): void {
	if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
		return;
	}

	const
		{unsafe} = component;

	const
		isKeyboardEvent = e instanceof KeyboardEvent,
		isLeftKey = (<KeyboardEvent>e).key === 'ArrowLeft';

	if (isKeyboardEvent ? !isLeftKey && (<KeyboardEvent>e).key !== 'ArrowRight' : (<MouseEvent>e).button !== 0) {
		return;
	}

	if (isKeyboardEvent || unsafe.mods.focused !== 'true') {
		e.preventDefault();

		if (isKeyboardEvent) {
			action();
		}

	} else {
		unsafe.async.setImmediate(action, {label: $$.setCursor});
	}

	function action(): void {
		const
			mask = unsafe.compiledMask;

		if (mask == null) {
			return;
		}

		const
			maskSymbols = mask!.symbols;

		const
			{input} = unsafe.$refs;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (input == null) {
			return;
		}

		const
			selectionStart = input.selectionStart ?? 0,
			selectionEnd = input.selectionEnd ?? 0;

		let
			canChange = true,
			pos;

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
						canChange = false;
						break;
					}

				} else {
					if (Object.isRegExp(maskSymbols[pos - 1])) {
						break;
					}

					pos++;
					if (pos >= maskSymbols.length) {
						canChange = false;
						break;
					}
				}
			}

			if (!canChange) {
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

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (input == null) {
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
